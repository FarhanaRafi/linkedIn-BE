import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";
import { UsersModel } from "../models.js";
import { getPDFReadableStream } from "../../lib/tools.js";

const usersRouter = Express.Router();

const userUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bw4_linkedin/users",
    },
  }),
}).single("image");

const expUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bw4_linkedin/experiences",
    },
  }),
}).single("image");

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const users = await UsersModel.findById(req.params.userId);
    if (users) {
      res.send(users);
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.send(204).send();
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:userId/image", userUploader, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    user.image = req.file.path;
    await user.save();
    if (user) {
      res.send({ message: "File uploaded successfully" });
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId/CV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=CV.pdf");
    const user = await UsersModel.findById(req.params.userId);
    const source = await getPDFReadableStream(user);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------
// -------------------- Experiences Part --------------------
// ------------------------------------------------------

usersRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const exp = req.body;
    const user = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      { $push: { experiences: exp } },
      { new: true, runValidators: true }
    );
    if (user) {
      res
        .status(201)
        .send({ _id: user.experiences[user.experiences.length - 1]._id });
    } else {
      next(createHttpError(404, `No user with id ${req.params.userId}`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user.experiences);
    } else {
      next(createHttpError(404, `No user with id ${req.params.userId}`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      const exp = user.experiences.find(
        (ex) => ex._id.toString() === req.params.expId
      );
      if (exp) {
        res.send(exp);
      } else {
        next(createHttpError(404, `No exp with id ${req.params.expId}`));
      }
    } else {
      next(createHttpError(404, `No user with id ${req.params.userId}`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      const i = user.experiences.findIndex(
        (ex) => ex._id.toString() === req.params.expId
      );
      if (i !== -1) {
        user.experiences[i] = {
          ...user.experiences[i].toObject(),
          ...req.body,
        };
        await user.save();
        res.send(user.experiences[i]);
      } else {
        next(createHttpError(404, `No exp with id ${req.params.expId}`));
      }
    } else {
      next(createHttpError(404, `No user with id ${req.params.userId}`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const user = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      { $pull: { experiences: { _id: req.params.expId } } },
      { new: true, runValidators: true }
    );
    if (user) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `No user with id ${req.params.userId}`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/:userId/experiences/:expId/image",
  expUploader,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const i = user.experiences.findIndex(
          (ex) => ex._id.toString() === req.params.expId
        );
        if (i !== -1) {
          user.experiences[i] = {
            ...user.experiences[i].toObject(),
            image: req.file.path,
          };
          await user.save();
          res.send(user.experiences[i]);
        } else {
          next(createHttpError(404, `No exp with id ${req.params.expId}`));
        }
      } else {
        next(createHttpError(404, `No user with id ${req.params.userId}`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get("/:userId/experiences/csv/download", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=experiences.csv`
      );
      const source = JSON.stringify(user.experiences);
      const transform = new Transform({
        fields: [
          "_id",
          "role",
          "company",
          "startDate",
          "endDate",
          "description",
          "area",
          "image",
        ],
      });
      const destination = res;

      pipeline(source, transform, destination, (err) => {
        if (err) console.log(err);
      });
    } else {
      next(createHttpError(404, `No user with id ${req.params.userId}`));
    }
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------
// -------------------- Friend Request --------------------
// ------------------------------------------------------

usersRouter.put(
  "/:senderId/friendRequest/:receiverId",
  async (req, res, next) => {
    try {
      const newSender = await UsersModel.findById(req.params.senderId);

      if (newSender) {
        if (!newSender.friends.includes(req.params.receiverId)) {
          if (
            !newSender.requestSend.includes(req.params.receiverId.toString())
          ) {
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.senderId,
              { $push: { requestSend: req.params.receiverId } },
              { new: true, runValidators: true }
            );
            const receiver = await UsersModel.findByIdAndUpdate(
              req.params.receiverId,
              { $push: { requestPending: req.params.senderId } },
              { new: true, runValidators: true }
            );
            res.send(`Friend Request sent`);
          } else {
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.senderId,
              { $pull: { requestSend: req.params.receiverId } },
              { new: true, runValidators: true }
            );
            const receiver = await UsersModel.findByIdAndUpdate(
              req.params.receiverId,
              { $pull: { requestPending: req.params.senderId } },
              { new: true, runValidators: true }
            );
            res.send(`Friend Request unsent`);
          }
        } else {
          res.send("You are already friends");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

usersRouter.put(
  "/:senderId/acceptRequest/:receiverId",
  async (req, res, next) => {
    try {
      const newFriend = await UsersModel.findById(req.params.senderId);
      if (newFriend) {
        if (
          !newFriend.requestPending.includes(req.params.receiverId.toString())
        ) {
          if (!newFriend.friends.includes(req.params.receiverId.toString())) {
            const receiver = await UsersModel.findByIdAndUpdate(
              req.params.senderId,
              {
                $push: { friends: req.params.receiverId },
                $pull: { requestPending: req.params.receiverId },
              },

              { new: true, runValidators: true }
            );
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.receiverId,
              {
                $push: { friends: req.params.senderId },
                $pull: { requestPending: req.params.senderId },
              },

              { new: true, runValidators: true }
            );
            res.send("Request accepted");
          } else {
            const receiver = await UsersModel.findByIdAndUpdate(
              req.params.senderId,
              { $pull: { friends: req.params.receiverId } },

              { new: true, runValidators: true }
            );
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.receiverId,
              { $pull: { friends: req.params.senderId } },

              { new: true, runValidators: true }
            );
            res.send("You are no more Friends");
          }
        } else {
          res.send("Send a request first please");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

usersRouter.put(
  "/:senderId/declineRequest/:receiverId",
  async (req, res, next) => {
    try {
      const newFriend = await UsersModel.findById(req.params.senderId);
      if (newFriend) {
        if (
          newFriend.requestPending.includes(req.params.receiverId.toString())
        ) {
          const receiver = await UsersModel.findByIdAndUpdate(
            req.params.senderId,
            { $pull: { requestPending: req.params.receiverId } },
            { new: true, runValidators: true }
          );
          const sender = await UsersModel.findByIdAndUpdate(
            req.params.receiverId,
            { $pull: { requestSend: req.params.senderId } },
            { new: true, runValidators: true }
          );
          res.send("Request Declined");
        } else {
          res.send("There is no request to decline");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

export default usersRouter;
