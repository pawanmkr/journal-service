import client from "../db.config.js";

export class Comment {
  static async createJournalCommentTable() {
    const query = `
          CREATE TABLE 
            IF NOT EXISTS journal_comment (
              id SERIAL PRIMARY KEY,
              journal_id INT NOT NULL,
              student_user_id VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW(),

              CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES journal (id) ON DELETE CASCADE,
              CONSTRAINT fk_student FOREIGN KEY (student_user_id) REFERENCES student (userid) ON DELETE CASCADE
            );
            `;
    try {
      await client.query(query);
    } catch (error) {
      console.error('Error creating journal_comment table:', error);
    }
  }

  static async createJournalComment(journalId, studentId, content) {
    const query = `
      INSERT INTO journal_comment (journal_id, student_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [journalId, studentId, content]);
      return result.rows[0]; // Assuming you want to return the newly created comment
    } catch (error) {
      console.error('Error creating journal comment:', error);
      return null;
    }
  }

  static async updateJournalComment(commentId, content) {
    const query = `
      UPDATE journal_comment
      SET content = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [commentId, content]);
      return result.rows[0]; // Assuming you want to return the updated comment
    } catch (error) {
      console.error('Error updating journal comment:', error);
      return null;
    }
  }

  static async deleteJournalComment(commentId) {
    const query = `
      DELETE FROM journal_comment
      WHERE id = $1;
    `;
    try {
      await client.query(query, [commentId]);
      return true; // Return true if deletion is successful
    } catch (error) {
      console.error('Error deleting journal comment:', error);
      return false; // Return false if deletion fails
    }
  }
}