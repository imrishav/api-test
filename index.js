const express = require('express');
const morgan = require('morgan');

const app = express();
const userRouter = require('./routes/authRoutes');

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/v1/users', userRouter);

module.exports = app;
