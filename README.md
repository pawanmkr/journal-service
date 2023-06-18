## Local Setup

To set up the project locally, please follow the steps below:

Navigate to the `journal/` or project root directory:

```bash
cd journal/
```

```bash
pnpm install
```

```bash
docker-compose up
```

```bash
pnpm run start
```

If you don't have docker on your system you can use you can modify `db.config.js` file
according to your preferences

# Service README

This service provides an API for user registration, login, and journal-related functionalities. It utilizes the Express framework for handling HTTP requests.

## Routes

### User Registration and Login

- **POST api/user/register**: Registers a new user.

```bash
{
    "full_name": "demo student",
    "email": "demostudent@gmail.com",
    "password": "password",
    "user_type": "student"
}
```

user_type can be `student` or `teacher only`
it will return `token` for further requests

- **POST api/user/login**: Authenticates a user and generates a token for subsequent protected routes.

```bash
{
    "email": "Olen93@yahoo.com",
    "password": "password",
    "user_type": "teacher"
}
```

you can go to `dummy-teachers.json` file to test with the already register user
it will also return `token`

### Journal-related Endpoints

These endpoints are protected and require authentication using a token. Only teachers have access to these routes.

- **POST api/journal/publish**: Publishes a journal entry. Requires authentication and accepts attachments (files) as multipart form data.

```bash
{
  "teacherId": "58a87645-862d-4ef2-ad4b-7a82c27bc8c0"
  "publishedAt": "2023-06-02T15:30:00.000Z"
  "description": "publish journal"
  "studentIds": "b4d9705e-3dec-46e3-bb61-e53610270cb1, 6869c0df-19b8-4fb5-afbb-ba193bf4aa50"
  "attachemts": files
}
```

Date is strictly in `ISO 8601` Format
Use multipart/form-data body for this response

- **DELETE api/journal/delete/:id**: Deletes a journal entry by its ID. Requires authentication.

To delete just provide the `:id` of the Journal in URL

- **PUT api/journal/update/:id**: Updates a journal entry by its ID. Requires authentication.

```bash
{
    "description": "the updated description of journal"
}
```

And `:id` of the Journal in URL

### HomeFeed Endpoints

These endpoints are protected and require authentication using a token. They provide access to the home feed for both students and teachers. Provide the id in URL of teacher or student to Fetch Journals

- **GET api/feed/student/:id**: Retrieves the home feed for a student, specified by their ID. Requires authentication.
- **GET api/feed/teacher/:id**: Retrieves the home feed for a teacher, specified by their ID. Requires authentication.

## Middleware

- **authorizeToken**: Middleware function used to authenticate and authorize requests by validating the access token.

## File Upload

- The route **POST api/journal/publish** accepts attachments (files) as multipart form data. The files are uploaded to the `uploads/` directory using the Multer middleware.

Please refer to the individual route handlers and middleware in the associated files for more detailed information on their implementation and functionality.
