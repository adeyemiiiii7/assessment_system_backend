require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require ("cors")
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
// Initialize Express app
const app = express();
const PORT = 8080;

app.use(cors())
app.use(morgan('combined'))
//middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);

// Connect to MongoDB
mongoose.connect(process.env.DB)
.then(() => {
    console.log("Connection Successful");
})
.catch((e) =>{
    console.log(e);
})

app.listen(PORT, (req,res)=>{
  console.log(`Server is running on port ${PORT}...`)
})
