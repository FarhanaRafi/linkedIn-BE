import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";
import { UsersModel } from "../models.js";

const usersRouter = Express.Router();

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

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "BE-DB/linkedIn",
    },
  }),
}).single("profile");

usersRouter.post(
  "/:userId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      user.image = req.file.path;
      await user.save();
      if (user) {
        res.send({ message: "File uploaded successfully" });
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

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

usersRouter.get("/:userId/experiences/csv", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=experiences.csv`
      );
      const source = user.experiences;
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

export default usersRouter;
