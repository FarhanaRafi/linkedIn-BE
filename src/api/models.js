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
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dgfcfb0rr/image/upload/v1679308763/BE-DB/blogs/t4abipr33ez7pqezobfr.jpg",
      required: true,
    },
    experience: [],
  },
  {
    timestamps: true,
  }
);

export const UsersModel = model("User", usersSchema);
