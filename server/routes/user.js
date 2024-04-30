const express = require("express");
const userRouter = express.Router();
const auth = require("../middleware/auth");
const Assessment = require("../models/assessment");
const {Question, questionSchema} = require("../models/questions");
const User = require("../models/user");
const mongoose = require('mongoose');
 
// View assessments available for the authenticated user
userRouter.get("/user/assessments", auth, async (req, res) => {
    try {
        const userId = req.user;
        console.log("LOG: user asessment")
        const assessment = await Assessment.find()
        console.log("LOG: ", assessment)
        return res.status(200).json(assessment);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Answer assessment questions
userRouter.post("/user/assessments/:assessmentId/answer", auth, async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { answers } = req.body; 
        const userId = req.user;
        const user = await User.findById(userId).populate('answeredAssessments.assessment');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        //if the user has answered the assessment before
        const answeredAssessment = user.answeredAssessments.find(aa => aa.assessment._id.toString() === assessmentId);
        if (answeredAssessment) {
            return res.status(400).json({ error: 'User has already answered this assessment' });
        }
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        const newAnswers = [];
        for (const answer of answers) {
            const { id: questionId, answerId, text } = answer;
            console.log(`Processing answer for questionId ${questionId} with answerId ${answerId}`);
            if (!questionId) {
                return res.status(400).json({ error: 'Question ID is missing in the request' });
            }
            const questionInAssessment = assessment.questions.find(q => q._id.toString() === questionId);

            if (!questionInAssessment) {
                return res.status(404).json({ error: `Question with ID ${questionId} not found in the assessment` });
            }
            // Check if the question type is 'personalAnswers'
            if (questionInAssessment.type === 'personalAnswers') {
                newAnswers.push({ question: questionInAssessment.text, answer: text });
            } else if (questionInAssessment.type === 'options') {
                // Find the selected option
                const option = questionInAssessment.options.find(opt => opt._id.toString() === answerId);
                if (!option) {
                    return res.status(400).json({ error: `Invalid answer option for question: ${questionInAssessment.text}` });
                }
                // Save the selected option to new answers
                newAnswers.push({ question: questionInAssessment.text, answer: option.text });
            }
        }
        const newAnsweredAssessment = {
            assessment: assessmentId,
            answers: newAnswers
        };
        user.answeredAssessments.push(newAnsweredAssessment);
        await user.save();
        res.json({ message: "Answers submitted successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// View assessment results and answers
userRouter.get("/user/assessments/:assessmentId/results", auth, async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.user;
        // Find the user 
        const user = await User.findById(userId).populate('answeredAssessments.assessment');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Find the answeredAssessment object within the user's answeredAssessments array
        const answeredAssessment = user.answeredAssessments.find(aa => aa.assessment._id.toString() === assessmentId);
        if (!answeredAssessment) {
            return res.status(404).json({ error: 'User has not answered this assessment yet' });
        }
        // Get the assessment details
        const assessment = answeredAssessment.assessment;
        const assessmentTitle = assessment.title;
        const userAnswers = answeredAssessment.answers;
        res.json({ assessmentTitle, userAnswers });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// // Give feedback
// userRouter.post("/user/assessments/:assessmentId/feedback", auth, async (req, res) => {
//   try {
//     const { assessmentId } = req.params;
//     const { feedback } = req.body;

//     const assessment = await Assessment.findById(assessmentId);
//     if (!assessment) {
//       return res.status(404).json({ error: 'Assessment not found' });
//     }


//     assessment.feedback = feedback;
//     await assessment.save();

//     res.json({ message: "Feedback submitted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// Cancel assessment
// userRouter.post("/user/assessments/:assessmentId/cancel", auth, async (req, res) => {
//     try {
//         const { assessmentId } = req.params;

//         const assessment = await Assessment.findById(assessmentId);
//         if (!assessment) {
//             return res.status(404).json({ error: 'Assessment not found' });
//         }

//         // flag 'cancelled' is set to true in the assessment document
//         assessment.cancelled = true;
//         await assessment.save();

//         res.json({ message: "Assessment canceled successfully" });
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

module.exports = userRouter;
