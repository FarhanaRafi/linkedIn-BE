import Express from "express";
import createHttpError from "http-errors"
import multer from "multer";
import q2m from "query-to-mongo"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const postsRouter = Express.Router()

export default postsRouter