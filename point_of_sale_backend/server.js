const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const authRouter = require('./controllers/auth.routes');
const verifyToken = require('./middleware/verify-token');
const createPosRouter = require('./controllers/create.pos.routes');
const itemRouter = require('./controllers/create.new.item.routes');
const categoryRouter = require('./controllers/new.category.routes');
const errorHandler = require('./middleware/error-handler.js');




mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use('/auth', authRouter);
app.use('/pos', createPosRouter);
app.use('/items', itemRouter);
app.use('/categories', categoryRouter);
app.use(errorHandler);

app.listen(3000, () => {
  console.log('The express app is ready!');
});