import cors from "cors";
import Express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import {
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
  genericErrorHandler,
} from "./errors.js";
import usersRouter from "./api/users/index.js";
import postsRouter from "./api/posts/index.js";

const server = Express();
const port = process.env.PORT || 3420;
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(400, `Origin ${currentOrigin} is not whitelisted.`)
        );
      }
    },
  })
);

server.use(Express.json());
server.use("/users", usersRouter);
server.use("/posts", postsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
  server.listen(port, () => {
    console.log(`Server started on Port ${port}.`);
  });
});
