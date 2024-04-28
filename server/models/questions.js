const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['options', 'personalAnswers'],
    default: 'options'
  },
  options: [
    {
      text: {
        type: String,
        required: false
      },
  
    }
  ],
  personalAnswer: {
    type: String, 
    required: false 
  }
});

const Question = mongoose.model("Question", questionSchema);

module.exports = {Question, questionSchema};
