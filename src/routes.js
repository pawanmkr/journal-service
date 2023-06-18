import express from 'express';
import authorization from './middlewares/auth.js';
import {
  registerUser,
  loginUser,
  publishJournal,
  updateJournal,
  deleteJournal,
  teacherFeed,
  studentFeed
} from './controllers/index.js';

const router = express.Router();
export default router;
import multer from 'multer';
const upload = multer({ dest: 'uploads/' })

/* To check if the server is properly working or not
 * Call this endpoint 
 */

/* User Registration and Login Endpoints */
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

/*
 * Endpoints related to journal
 *
 * These are the protected endpoints and need permission before access
 * Only available to teachers
 */
router.post('/journal/publish', authorization, upload.array('attachments', 10), publishJournal);
router.delete('/journal/delete/:id', authorization, deleteJournal);
router.put('/journal/update/:id', authorization, updateJournal);

/* router.post('/journal/like/:id', authorization, likeJournal);
   router.post('/journal/comment/:id', authorization, commentOnJournal); */

/*
 * Protected endpoints for HomeFeed Student and Teacher
 */
router.get('/feed/student/:id', authorization, studentFeed);
router.get('/feed/teacher/:id', authorization, teacherFeed);
