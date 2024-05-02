const mongoose = require('mongoose');

const answeredAssessmentSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    },
    answers: [{
        question: String, 
        answer: String
    }]
});

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                // Check if the password contains at least one symbol and one number
                return /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9]).{6,}$/.test(value);
            },
            message: "Password must contain at least one symbol and one number, and be at least 6 characters long"
        }
    },
    assessments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    }],
    answeredAssessments: [answeredAssessmentSchema], 
    feedbacks: [{
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment'
        },
        feedback: String,
        username: String
    }],
    cancelledAssessments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
