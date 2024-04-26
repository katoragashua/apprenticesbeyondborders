import express, { Router } from "express";
const app = express();
import { config } from "dotenv";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import "express-async-errors";
config();
const router = Router();
import path from "path";

import mongoose from "mongoose";
import Isemail from "isemail";
const { Schema } = mongoose;

class CustomError extends Error {
  constructor(message) {
    super(message);
  }
}

class BadRequestError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

const errorHandlerMiddleware = (error, req, res, next) => {
  let customError = {
    // set default
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: error.message || "Something went wrong try again later",
  };
  if (error.name === "ValidationError") {
    customError.msg = Object.values(error.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  if (error.code && error.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      error.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }
  if (error.name === "CastError") {
    customError.msg = `No item found with id : ${error.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
  // res.status(error.statusCode).json(error.message);
};

const notFound = (req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .send("Page not found. Please check the URL.");
};

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please enter a valid email"],
    unique: [true, "This email has already been waitlisted"],
    trim: true,
    maxlength: 30,
    unique: true,
    trim: true,
    validate: [(val) => Isemail.validate(val), "Enter a valid email address."],
    lowercase: true,
  },
});

const User = mongoose.model("User", userSchema);

const saveUserEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) throw new BadRequestError("Please enter a valid email");
  const alreadyExists = await User.findOne({ email: email });
  if (alreadyExists)
    throw new BadRequestError(
      `${email} has already subscribed, use a different email.`
    );

  const user = await User.create({ email });
  await User.deleteMany({});
  res.status(200).json({ msg: "You have subscribed successfully.", user });
};

const getEmails = async (req, res) => {
  const users = await User.find();
  res.status(200).json({ msg: "Success", users });
};

app.use(morgan("tiny"));
app.use(express.json());
app.use("/", express.static(path.resolve("./public")));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post("/api/v1/users", saveUserEmail);
app.get("/api/v1/users", getEmails);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
