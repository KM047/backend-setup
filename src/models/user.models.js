import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, "Please enter your full name"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String, // https://cloudinary.com/url
      required: true,
      // publicId: {
      //   type: String,
      //   required: true,
      // },
      // url: {
      //   type: String,
      //   required: true,
      // },
    },
    coverImage: {
      type: String,

      // publicId: {
      //   type: String,
      //   // required: true,
      // },
      // url: {
      //   type: String,
      //   // required: true,
      // },
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // ? This check is necessary because we don't want to rerun this code on every entity change

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = model("User", userSchema);
