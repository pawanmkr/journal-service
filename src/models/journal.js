import client from "../db.config.js";
import chalk from "chalk";

export class Journal {
  static async createJournalTable() {
    const query = `
      CREATE TABLE 
        IF NOT EXISTS journal (
          id SERIAL PRIMARY KEY,
          description TEXT NOT NULL,
          teacher_user_id VARCHAR(255) NOT NULL,
          published_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),

          CONSTRAINT fk_teacher FOREIGN KEY (teacher_user_id) REFERENCES teacher (userid) ON DELETE CASCADE
        );
    `;
    try {
      await client.query(query);
    } catch (error) {
      console.error('Error creating journal table:', error);
    }
  }

  static async createJournalStudentTable() {
    const query = `
      CREATE TABLE 
        IF NOT EXISTS journal_student (
          journal_id INT NOT NULL,
          student_user_id VARCHAR(255) NOT NULL,

          CONSTRAINT pk_journal_student PRIMARY KEY (journal_id, student_user_id),
          CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES journal (id) ON DELETE CASCADE,
          CONSTRAINT fk_student FOREIGN KEY (student_user_id) REFERENCES student (userid) ON DELETE CASCADE
        );
      `;
    try {
      await client.query(query);
    } catch (error) {
      console.error('Error creating journal_student table:', error);
    }
  }

  static async createJournal(description, teacherUserId, publishedAt, studentIds) {
    const query = `
      INSERT INTO journal (description, teacher_user_id, published_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [description, teacherUserId, publishedAt]);
      const journal = result.rows[0];

      if (studentIds && studentIds.length > 0) {
        for (const studentId of studentIds) {
          // check if the mapping has been already done
          const checkQuery = `
            SELECT * FROM journal_student WHERE journal_id = $1 AND student_user_id = $2;
          `;
          const tagValues = [journal.id, studentId];
          const exists = await client.query(checkQuery, tagValues);

          if (exists.rowCount === 0) {
            // Tag students in the journal
            const tagQuery = `
              INSERT INTO journal_student (journal_id, student_user_id) VALUES ($1, $2);
            `;
            await client.query(tagQuery, tagValues);
          }
        }
      }
      return journal;
    } catch (error) {
      console.error('Error creating journal:', error);
      return null;
    }
  }


  static async updateJournal(id, description) {
    const query = `
      UPDATE journal
      SET description = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [id, description]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating journal:', error);
      return null;
    }
  }

  static async deleteJournal(id) {
    const query = `
      DELETE FROM journal
      WHERE id = $1 RETURNING *;
    `;
    try {
      const res = await client.query(query, [id]);
      console.log(res.rows[0]);
      return res.rows[0];
    } catch (error) {
      console.error('Error deleting journal:', error);
      return false; // Return false if deletion fails
    }
  }

  static async getTeacherJournalsById(teacherUserId) {
    const query = `
      SELECT * FROM journal
      WHERE teacher_user_id = $1;
    `;
    try {
      const result = await client.query(query, [teacherUserId]);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving teacher journals:', error);
      return [];
    }
  }

  static async getJournalsByStudentId(studentUserId) {
    const query = `
      SELECT journal.*
      FROM journal
      INNER JOIN journal_student
      ON journal.id = journal_student.journal_id
      WHERE journal_student.student_user_id = $1;
    `;
    try {
      const result = await client.query(query, [studentUserId]);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving journals by student ID:', error);
      return [];
    }
  }


}
