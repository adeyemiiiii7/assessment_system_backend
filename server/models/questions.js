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
        required: true
      },
      // Add any additional fields related to options if needed
    }
  ],
  personalAnswer: {
    type: String,
    required: false // Optional field, only applicable for 'personalAnswers' type questions
  }
});

const Question = mongoose.model("Question", questionSchema);

module.exports = {Question, questionSchema};
