
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const logger = require('morgan');
const authRouter = require('./point_of_sale_backend/controllers/auth.routes');
const createPosRouter = require('./point_of_sale_backend/controllers/create.pos.routes');




mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
app.use(express.json());
app.use(logger('dev'));
// Routes go here

app.use('/auth', authRouter);
app.use('/pos', createPosRouter);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}!`);
});
