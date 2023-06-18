import pkg from 'pg';
const { Pool } = pkg;

/* const client = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'flights',
  password: 'mint',
  port: 5432,
}); */

// docker container
const client = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'journaldb',
  password: 'mint',
  port: 5434,
});

// const client = new Pool({
//   connectionString: process.env.DB_CONNECTION_STRING,
// });

export default client;