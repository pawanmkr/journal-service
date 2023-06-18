import client from "../db.config.js";

export class Attachment {
  static async createAttachmentTable() {
    const query = `
      CREATE TABLE 
        IF NOT EXISTS attachment (
          id SERIAL PRIMARY KEY,
          journal_id INT NOT NULL,
          type VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES journal (id) ON DELETE CASCADE
      );
    `;
    try {
      await client.query(query);
    } catch (error) {
      console.error('Error creating attachment table:', error);
    }
  }

  static async createAttachment(journalId, type, url) {
    const query = `
      INSERT INTO attachment (journal_id, type, url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [journalId, type, url]);
      return result.rows[0]; // Assuming you want to return the newly created attachment
    } catch (error) {
      console.error('Error creating attachment:', error);
      return null;
    }
  }
}