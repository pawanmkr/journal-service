import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';

dotenv.config({
  path: path.join(process.cwd(), '.env')
});
const jwtSecret = process.env.JWT_SECRET;

export default async function authorization(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === null) res.sendStatus(401);
  if (token) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ error: 'Failed to authenticate token.' });
      }
      req.user = user;
      console.log(chalk.black.bgGreen("User Verified"));
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided.' });
  }
};