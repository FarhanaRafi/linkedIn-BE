import mongoose from "mongoose";

const { Schema, model } = mongoose;

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, require: true },
    email: { type: String, require: true },
    bio: { type: String, require: true },
    title: { type: String, require: true },
    area: { type: String, require: true },
    image: { type: String },
    experience: [],
  },
  {
    timestamps: true,
  }
);

export const UsersModel = model("User", usersSchema);
