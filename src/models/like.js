import client from "../db.config.js";

export class Like {
  static async createJournalLikeTable() {
    const query = `
      CREATE TABLE 
        IF NOT EXISTS journal_like (
          journal_id INT NOT NULL,
          student_user_id VARCHAR(255) NOT NULL,
          CONSTRAINT pk_journal_like
          PRIMARY KEY (journal_id, student_user_id),
          CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES journal (id) ON DELETE CASCADE,
          CONSTRAINT fk_student FOREIGN KEY (student_user_id) REFERENCES student (userid) ON DELETE CASCADE
        );
    `;
    try {
      await client.query(query);
    } catch (error) {
      console.error('Error creating journal_like table:', error);
    }
  }

  static async likeJournal(journalId, studentId) {
    const query = `
      INSERT INTO journal_like (journal_id, student_id)
      VALUES ($1, $2);
    `;
    try {
      await client.query(query, [journalId, studentId]);
      return true; // Return true if like is successful
    } catch (error) {
      console.error('Error liking journal:', error);
      return false; // Return false if liking fails
    }
  }

  static async unlikeJournal(journalId, studentId) {
    const query = `
      DELETE FROM journal_like
      WHERE journal_id = $1 AND student_id = $2;
    `;
    try {
      await client.query(query, [journalId, studentId]);
      return true; // Return true if unlike is successful
    } catch (error) {
      console.error('Error unliking journal:', error);
      return false; // Return false if unliking fails
    }
  }
}