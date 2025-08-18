require('dotenv').config();
const express = require('express');
const cors =  require("cors");
const cookieParser = require('cookie-parser');

const app = express();

const {PORT} = require("./config")

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});