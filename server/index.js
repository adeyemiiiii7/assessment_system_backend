const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require ("cors")
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
// Initialize Express app
const app = express();
const PORT = 8080; 
const DB = 'mongodb+srv://adeyemi:TITIlope1970@cluster0.sjpo9ga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'


app.use(cors())
app.use(morgan('combined'))
//middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);

// Connect to MongoDB
mongoose
.connect(DB)
.then(() => {
    console.log("Connection Successfull");
})
.catch((e) =>{
    console.log(e);
})

// app.get('/api/data', (req, res) => {
//   // Handle your API logic here
//   const data = { message: 'Hello from the server!' };
//   res.json(data);
// });

app.listen(PORT, (req,res)=>{
  console.log(`Server is running on port ${PORT}...`)
})
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on port ${PORT}`);
// });
