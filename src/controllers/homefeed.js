import { Journal } from "../models/journal.js";
import { Student } from "../models/student.js";

export async function teacherFeed(req, res, next) {
  const teacher_user_id = req.params.id;

  try {
    const journals = await Journal.getTeacherJournalsById(teacher_user_id);
    if (!journals || journals.length === 0) {
      return res.status(404).json({ error: "No journals found for the teacher." });
    }
    res.json({ journals });
  } catch (error) {
    console.error('Error retrieving teacher journals:', error);
    res.status(500).json({ error: "Internal server error." });
  }
}

export async function studentFeed(req, res, next) {
  const student_user_id = req.params.id;
  let user = req.user;
  try {
    user = await Student.findExistingStudentById(user.userid);
    if (!user) {
      return res.status(404).send("No user found");
    }
    const journals = await Journal.getJournalsByStudentId(student_user_id);
    if (!journals || journals.length === 0) {
      return res.status(404).json({ error: "No journals found for the student." });
    }
    res.json({ journals });
  } catch (error) {
    console.error('Error retrieving student journals:', error);
    res.status(500).json({ error: "Internal server error." });
  }
}
