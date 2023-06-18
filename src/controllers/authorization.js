import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config()
import { Teacher } from '../models/index.js';
import { Student } from '../models/index.js';
import { Journal } from '../models/index.js';

const jwtSecret = process.env.JWT_SECRET;

export async function registerUser(req, res, next) {
  try {
    const { full_name, email, password, user_type } = req.body;

    let existingUser;
    if (user_type === 'teacher') {
      existingUser = await Teacher.findExistingTeacherInDB(email);
    } else if (user_type === 'student') {
      existingUser = await Student.findExistingStudentInDB(email);
    } else {
      res.status(400).json("Invalid user_type. Please provide either 'teacher' or 'student'.");
      return;
    }

    if (existingUser) {
      res.status(400).json("User Already Exists, Please login with your credentials");
      return;
    }

    const hashedPassword = await hashPassword(password);
    const userid = uuidv4();

    let newUser;
    if (user_type === 'teacher') {
      newUser = await Teacher.registerNewTeacherInDB(full_name, userid, email, hashedPassword);
    } else if (user_type === 'student') {
      newUser = await Student.registerNewStudentInDB(full_name, userid, email, hashedPassword);
    }

    if (newUser) {
      const token = generateToken(userid);
      res.status(201).json({
        message: "User Registered Successfully",
        user: newUser,
        token: token
      });
    } else {
      res.status(500).json("Registration Failed");
    }
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password, user_type } = req.body;

    let user;
    if (user_type === 'student') {
      user = await Student.findExistingStudentInDB(email);
    } else if (user_type === 'teacher') {
      user = await Teacher.findExistingTeacherInDB(email);
    } else {
      res.status(400).json("Invalid user_type. Please provide either 'teacher' or 'student'.");
      return;
    }

    if (!user) {
      res.status(404).json("User not found. Please register first.");
      return;
    }

    const hashedPassword = await hashPassword(password);

    if (!await bcrypt.compare(password, hashedPassword)) {
      res.status(401).json("Invalid credentials. Please try again.");
      return;
    }

    const token = generateToken(user.userid);
    res.status(200).json({
      message: "Login Successful",
      user: user,
      token: token
    });
  } catch (error) {
    next(error);
  }
}

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

function generateToken(userid) {
  const payload = {
    userid: userid
  };
  const options = {
    expiresIn: '24h' // Token expiration time
  };
  const token = jwt.sign(payload, jwtSecret, options);
  return token;
}
