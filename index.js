const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const postRoute = require('./routes/post')
const app = express();
dotenv.config();
const DB_Url = process.env.MONGO_URL;

// mongoDB connection method;
mongoose.connect(DB_Url)
.then(() => console.log('DB connected successfully...'))
.catch((err) => console.log(err))

// middlewares;
app.use(helmet())
app.use(express.json())
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/post', postRoute);

// server connnection method;
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Server running...'));
