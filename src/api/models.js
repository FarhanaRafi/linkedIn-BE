import mongoose from "mongoose";

const { Schema, model } = mongoose;

const experienceSchema = new Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, required: true },
    area: { type: String, required: true },
    image: {
      default: "https://picsum.photos/300/300",
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema(
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
    experiences: { default: [], type: [experienceSchema] },
    friends: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
    requestSend: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
    requestPending: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const commentSchema = new Schema(
  {
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const postSchema = new Schema(
  {
    text: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dgfcfb0rr/image/upload/v1679308763/BE-DB/blogs/t4abipr33ez7pqezobfr.jpg",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    likes: {
      default: [],
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    comments: { default: [], type: [commentSchema] },
  },
  {
    timestamps: true,
  }
);

export const UsersModel = model("User", userSchema);
export const PostsModel = model("Post", postSchema);
// export const CommentModel = model("Comment", commentSchema);
