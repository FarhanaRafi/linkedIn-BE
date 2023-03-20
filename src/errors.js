import mongoose from "mongoose";

export const badRequestHandler = (err, req, res, next) => {
  if (err.status === 400 || err instanceof mongoose.Error.ValidationError) {
    res
      .status(400)
      .send({
        success: false,
        message: err.message,
        errorsList: err.errorList ? err.errorsList.map((e) => e.msg) : [],
      });
  } else if (err instanceof mongoose.Error.CastError) {
    res.status(400).send({ message: "Please enter a correct ID" });
  } else {
    next(err);
  }
};

export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const notfoundHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ success: false, message: err.message });
  } else {
    next(err);
  }
};

export const genericErrorHandler = (err, req, res, next) => {
  res
    .status(500)
    .send({
      success: false,
      message: "Check the backend console to see what's going on",
    });
  console.log(err);
};
