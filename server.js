const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const cors = require('cors');

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION ⛔️, Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' }); //to get access to environment variables
const app = require('./app');

app.use(
  cors({
    origin: 'http://localhost:5000',
  })
);

// app.use('/api/v1/tours', require('./routes/tourRoutes'));
// app.use('/api/v1/users', require('./routes/userRoutes'));
// app.use('/api/v1/reviews', require('./routes/reviewRoutes'));

// console.log('express environment = ', app.get('env'));
// console.log('node environment = ', process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// those options deals with some deprecation warnings
// connect returns a promise
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database Connected Successfully!'.cyan.bold));
//con(connection) is the resolved value of the promise (goes into the parantheses).

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}...`);
});

// handle unhandle rejections
process.on('unhandledRejection', (err) => {
  console.log(err);
  // console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION ⛔️, Shutting down...');
  server.close(() => {
    process.exit(1); //0 = Success, 1 = Uncaught Exception
  });
});
