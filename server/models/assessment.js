const mongoose = require('mongoose');
const { questionSchema } = require('../models/questions');

const assessmentSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true 
  },
  lastname: {
    type: String,
    required: true 
  },
  questions: [questionSchema], 
  cancelled: {
    type: Boolean,
    default: false
  }
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
