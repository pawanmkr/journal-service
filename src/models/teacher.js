import client from "../db.config.js";
import chalk from "chalk";

export class Teacher {
  static async createTeacherTable() {
    const query = `
      CREATE TABLE 
        IF NOT EXISTS teacher (
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
      console.error('Error creating teacher table:', error);
    }
  }

  static async findExistingTeacherInDB(email) {
    const query = `
      SELECT * FROM teacher WHERE email = $1;
    `;
    try {
      const result = await client.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding teacher in DB:', error);
      return null;
    }
  }

  static async registerNewTeacherInDB(full_name, userid, email, hashedPassword) {
    const query = `
      INSERT INTO teacher (full_name, userid, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [full_name, userid, email, hashedPassword]);
      return result.rows[0];
    } catch (error) {
      console.error('Error registering new teacher in DB:', error);
      return null;
    }
  }
}
