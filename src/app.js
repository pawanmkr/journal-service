import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import router from './routes.js';
import client from './db.config.js';
import chalk from 'chalk';
import seedDatabase from '../seed.js';

const app = express();
let server;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Database connection and error handling
client.connect(async (err, client) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    retryConnection();
  } else {
    console.log(chalk.black.bgGreen('Connected to the database'));
    client.release();
  }
});

// Retry database connection
const retryConnection = () => {
  setTimeout(() => {
    console.log('Retrying database connection...');
    client.connect((err, client, done) => {
      if (err) {
        retryConnection();
      } else {
        console.log('Connected to the database');

        client.release();
      }
    });
  }, 3000);
};

await seedDatabase();

// Routes
app.get('/health', (req, res, next) => {
  res.sendStatus(200);
});
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Start the server
const port = process.env.PORT || 3000;
server = app.listen(port, () => {
  console.log(`HTTP Server Started\nGET request for health check http://localhost:${port}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // close database connections, perform cleanup tasks, etc.
    process.exit(0);
  });
});