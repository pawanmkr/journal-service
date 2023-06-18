import { Journal, Attachment } from "../models/index.js";
import { uploadAttachment } from "../lib/services/azureStorage.js";

export async function publishJournal(req, res, next) {
  try {
    const { description, teacherId, publishedAt, studentIds } = req.body;
    const students = studentIds.split(',').map((id) => id.trim());
    const attachments = req.files;
    // Input validation
    if (!description || !teacherId || !publishedAt) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // publishedAt is an ISO 8601 Date format no other format is acceptable
    if (!isValidDateFormat(publishedAt)) {
      return res.status(400).json({ message: "Invalid date format. Expected ISO 8601 format." });
    }
    // edge case, check if teacher exists or not
    const journal = await Journal.createJournal(description, teacherId, publishedAt, students);

    if (journal) {
      if (attachments && attachments.length > 0) {
        const attachmentPromises = attachments.map(async (attachment) => {
          const uploadedUrl = await uploadAttachment(attachment);
          const { mimetype } = attachment;
          return Attachment.createAttachment(journal.id, mimetype, uploadedUrl);
        });
        await Promise.all(attachmentPromises);
      }

      res.status(201).json({
        id: journal.id,
        description: journal.description,
        published_at: journal.published_at,
        teacher: journal.teacher_user_id
      });
    } else {
      res.status(500).json({ error: 'Failed to create journal entry.' });
    }
  } catch (error) {
    console.error('Error publishing journal:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

function isValidDateFormat(dateString) {
  // Create a regular expression pattern to match the ISO 8601 date format
  const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return pattern.test(dateString);
}


export async function updateJournal(req, res, next) {
  try {
    const { description } = req.body;
    const id = req.params.id;
    if (!id || !description) {
      return res.status(400).json({ message: "Missing required parameters." });
    }

    const updated = await Journal.updateJournal(id, description);

    if (updated) {
      res.status(200).json({
        id: updated.id,
        description: updated.description,
        published_at: updated.published_at,
        teacher: updated.teacher_user_id
      });
    } else {
      res.status(404).json({ error: 'Journal not found.' });
    }
  } catch (error) {
    console.error('Error updating journal:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function deleteJournal(req, res, next) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Missing required parameters." });
    }

    const deleted = await Journal.deleteJournal(id);

    if (deleted) {
      res.status(200).json({
        id: deleted.id,
        description: deleted.description,
        published_at: deleted.published_at,
        teacher: deleted.teacher_user_id
      });
    } else {
      res.status(404).json({ error: 'Journal not deleted.' });
    }
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
