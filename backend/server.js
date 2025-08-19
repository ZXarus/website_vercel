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

const middleware = require("./routes/middleware")

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use("/api", middleware, apiRoutes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});