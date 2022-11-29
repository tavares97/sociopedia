import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

/* REGISTER USER */
export async function register(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    //generates a random string to add before hashing
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 500),
      impressions: Math.floor(Math.random() * 900),
    });

    //Saves it to the DB
    const savedUser = await newUser.save();
    //Returns User object to the frontend
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/* LOGGING IN USER */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    //Finds user and checks if exists
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ err: "User does not exist" });

    //Compares passwords for login
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ err: "Invalid Password" });

    //Creates token for user auth and deletes pw for the frontend
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
