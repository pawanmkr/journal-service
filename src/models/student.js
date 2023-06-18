import client from "../db.config.js";
import chalk from "chalk";

export class Student {
  static async createStudentTable() {
    const query = `
      CREATE TABLE 
        IF NOT EXISTS student (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          userid VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
    `;
    try {
      await client.query(query);
    } catch (error) {
      console.error('Error creating student table:', error);
    }
  }

  static async findExistingStudentInDB(email) {
    const query = `
      SELECT * FROM student WHERE email = $1;
    `;
    try {
      const result = await client.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding student by Id:', error);
      return null;
    }
  }

  static async findExistingStudentById(userid) {
    const query = `
      SELECT * FROM student WHERE userid = $1;
    `;
    try {
      const result = await client.query(query, [userid]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding student in DB:', error);
      return null;
    }
  }

  static async registerNewStudentInDB(full_name, userid, email, hashedPassword) {
    const query = `
      INSERT INTO student (full_name, userid, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [full_name, userid, email, hashedPassword]);
      return result.rows[0]; // Assuming you want to return the newly registered student
    } catch (error) {
      console.error('Error registering new student in DB:', error);
      return null;
    }
  }
}