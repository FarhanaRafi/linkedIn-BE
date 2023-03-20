import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { UsersModel } from "../models.js";

const usersRouter = Express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/:userId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
usersRouter.put("/:userId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
usersRouter.delete("/:userId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
