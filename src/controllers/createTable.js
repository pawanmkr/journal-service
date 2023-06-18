import { Journal } from "../models/index.js";
import { Student } from "../models/index.js";
import { Teacher } from "../models/index.js";
import { Attachment } from "../models/index.js";
import { Comment } from "../models/index.js";
import { Like } from "../models/index.js";

export async function createTables() {
  try {
    await Student.createStudentTable();
    await Teacher.createTeacherTable();
    await Journal.createJournalTable();
    await Journal.createJournalStudentTable();
    await Attachment.createAttachmentTable();
    await Like.createJournalLikeTable();
    await Comment.createJournalCommentTable();
    console.log("New Tables Created");
  } catch (error) {
    console.log(`Error creating tables: ${error}`);
  }
}