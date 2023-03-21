import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { PostsModel } from "../models.js";

const postsRouter = Express.Router();

const postUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bw4_linkedin/posts",
    },
  }),
}).single("image");

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostsModel(req.body);
    const createdPost = await newPost.save();
    res.status(201).send(createdPost);
  } catch (error) {
    next(error);
  }
});
postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const posts = await PostsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({
        path: "user",
        select: "name surname image",
      });
    const total = await PostsModel.countDocuments(mongoQuery.criteria);
    res.send({
      links: mongoQuery.links(process.env.BE_URL + "/posts", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    next(error);
  }
});
postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const posts = await PostsModel.findById(req.params.postId).populate({
      path: "user",
      select: "name surname image",
    });
    if (posts) {
      res.send(posts);
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
postsRouter.put("/:postId", async (req, res, next) => {
  try {
    const updatedPost = await PostsModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletePost = await PostsModel.findByIdAndDelete(req.params.postId);
    if (deletePost) {
      res.send(204).send();
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
postsRouter.post("/:postId/image", postUploader, async (req, res, next) => {
  try {
    const post = await PostsModel.findById(req.params.postId);
    post.image = req.file.path;
    await post.save();
    if (post) {
      res.send({ message: "File uploaded successfully" });
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------
// -------------------- Likes Part --------------------
// ------------------------------------------------------

// probably not needed, we already see the number of likes when fetching the post itself
postsRouter.get("/:postId/like", async (req, res, next) => {
  try {
    const post = await PostsModel.findById(req.params.postId)
    if (post) {
      res.send(post.likes)
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error)
  }
})

// pass id of user to like the post in body { _id: <id> }
postsRouter.put("/:postId/like", async (req, res, next) => {
  try {
    const post = await PostsModel.findById(req.params.postId)
    if (post) {
      const isLiked = post.likes.includes(req.body._id)
      if (isLiked) {
        post.likes = post.likes.filter(id => id.toString() !== req.body._id)
    } else {
        post.likes.push(req.body._id)
    }
    post.save()
    res.send({isLiked: isLiked})
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error)
  }
})

export default postsRouter;
