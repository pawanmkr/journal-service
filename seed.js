import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import chalk from 'chalk';
import client from './src/db.config.js';
import { createTables } from './src/controllers/createTable.js';
import { Student, Teacher, Journal } from "./src/models/index.js";
import fs from 'fs';

/*
 * this program is only for seeding data into tables before starting the service
 * 
 * first it drop the tables
 * the create new tables again
 * then it does the seeding part suing ** faker.js **
 * and takes couple of seconds due to thousands of rows
 * 
 * 
 */

const studentIds = [];
const teacherIds = [];
const seededJournals = [];
export default async function seedDatabase() {
  try {
    const dropTables = async () => {
      const tableNames = [
        "student",
        "teacher",
        "journal",
        "attachment",
        "journal_student",
        "journal_comment",
        "journal_like",
      ];

      for (let i = 0; i < tableNames.length; i++) {
        try {
          await client.query(`DROP TABLE IF EXISTS ${tableNames[i]} CASCADE`);
        } catch (error) {
          console.error(`Error dropping table: ${tableNames[i]}`, error);
        }
      }
    };

    dropTables().then(async () => {
      console.log('Dropped old tables');
      await createTables();
    }).catch((error) => {
      console.error('Error dropping tables:', error);
    });

    // students
    const users = await generateUser(20);
    await seedStudent(users);

    // teachers
    const teachers = await generateUser(2);
    await seedTeacher(teachers);

    // journals
    const journals = await generateJournal(50);
    await seedJournals(journals);

    console.log(chalk.black.bgGreen("Database Seeding Successful!"));
  } catch (error) {
    console.log("Database seeding failed", error);
  }
  await exportTablesToJson();
}


async function exportTablesToJson() {
  try {
    const studentQuery = `
      SELECT json_agg(row_to_json(student)) AS json_data
      FROM student;
    `;
    let result = await client.query(studentQuery);
    let jsonData = result.rows[0].json_data;
    fs.writeFileSync('dummy-students.json', JSON.stringify(jsonData, null, 2));

    const teacherQuery = `
      SELECT json_agg(row_to_json(teacher)) AS json_data
      FROM teacher;
    `;
    result = await client.query(teacherQuery);
    jsonData = result.rows[0].json_data;
    fs.writeFileSync('dummy-teachers.json', JSON.stringify(jsonData, null, 2));

    console.log('Export complete');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    client.end();
  }
}

/*
 * execution ends here 
 */


async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function generateUser(max) {
  const list = [];
  console.log("Generating Users...");
  for (let i = 0; i < max; i++) {
    const json = {
      userid: uuidv4().substring(0, 10),
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      hashedPassword: await hashPassword("password"),
    }
    list.push(json);
  }
  return list;
}

const studentsArray = [];
async function seedStudent(users) {
  console.log("Registering Students...");
  for (const user of users) {
    const { userid, full_name, email, hashedPassword } = user;
    const student = await Student.registerNewStudentInDB(full_name, userid, email, hashedPassword);
    studentIds.push(student.userid);
    studentsArray.push(student);
  }
  return studentsArray;
}



async function seedTeacher(users) {
  for (const user of users) {
    const { userid, full_name, email, hashedPassword } = user;
    const teacher = await Teacher.registerNewTeacherInDB(full_name, userid, email, hashedPassword);
    teacherIds.push(teacher.userid);
  }
}

async function tagStudents() {
  const list = [];
  const tagCount = Math.floor(Math.random() * studentIds.length);
  for (let i = 0; i <= tagCount; i++) {
    const random = Math.floor(Math.random() * studentIds.length);
    list.push(studentIds[random]);
  }
  return list;
}

async function generateJournal(max) {
  const list = [];
  console.log("Generating Journals...");
  for (let i = 0; i < max; i++) {
    const random = Math.floor(Math.random() * teacherIds.length);

    const json = {
      description: faker.lorem.sentence(10),
      teacherUserId: teacherIds[random],
      publishedAt: new Date(),
      studentIds: await tagStudents()
    }
    list.push(json);
  }
  return list;
}

async function seedJournals(journals) {
  console.log("Publishing Journals...");
  for (const item of journals) {
    const { description, teacherUserId, publishedAt, studentIds } = item;
    const journal = await Journal.createJournal(description, teacherUserId, publishedAt, studentIds);
    seededJournals.push(journal);
  }
}