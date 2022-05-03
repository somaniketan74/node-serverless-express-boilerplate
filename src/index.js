import helmet from 'helmet';
import express from 'express';
import serverless from 'serverless-http';
import httpStatus from 'http-status';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import { initiateDBConnection, closeDBConnection } from './config/db';

const app = express();

app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) =>
  res.json({
    msg: 'Default end point',
  })
);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

/* eslint-disable-next-line */
//export const handler = serverless(app);

// or as a promise
const h = serverless(app);

/* eslint-disable-next-line */
export const handler = async (event, context) => {
  // you can do other things here
  await initiateDBConnection();
  const result = await h(event, context);
  // and here
  await closeDBConnection();
  return result;
};
