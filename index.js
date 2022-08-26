import express from "express";
import mongoose from "mongoose";
import { validator } from "./validations/validator.js";
import { validationResult } from "express-validator";
import UserModel from "./models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const PORT = 4000;
app.use(express.json());
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://admin:__admin@cluster0.deo3m4o.mongodb.net/users?retryWrites=true&w=majority"
  )
  .then(console.log("database is connected successfully"))
  .catch((err) => {
    console.log("error connecting to the database", err);
  });

app.get("/registration", (req, res) => {
  res.json({
    sucsess: true,
    page: 'registration',
  });
});

app.post("/registration", validator, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.passwordHash;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      username: req.body.username,
      passwordHash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "somekey",
      {
        expiresIn: "30d",
      }
    );

    const userData = user._doc;

    res.json({
      userData,
      token,
      msg: "Регистрация удалось",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Регистрация не удалась",
    });
  }
});

app.get("/login", (req, res) => {
  res.json({
    sucsess: true,
    page: 'login',
  });
});

app.post("/login", validator, async (req, res) => {
  try {
    const user = await UserModel.findOne({ usename: req.body.username });

    if (!user) {
      return res.status(404).json({
        msg: "Пользователь не найлен",
      });
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPassword) {
      return res.status(404).json({
        msg: "Пользователь не найлен",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "somekey",
      {
        expiresIn: "30d",
      }
    );

    const userData = user._doc;

    res.json({
      userData,
      token,
      msg: "Авторизация удалась",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Авторизация не удалась",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server starting on PORT: ${PORT}`);
});
