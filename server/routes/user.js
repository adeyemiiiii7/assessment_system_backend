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
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Answer assessment questions
userRouter.post("/user/assessments/:assessmentId/answer", auth, async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { answers } = req.body;

        console.log("Received answers:", answers); // Log the answers array to verify its contents and structure

        // Log the assessmentId received to ensure it matches the expected format
        console.log("Received assessmentId:", assessmentId);

        // Find the user based on the authenticated user's ID
        const userId = req.user;

        // Find the user document and populate the answeredAssessments field to include the assessment information
        const user = await User.findById(userId).populate('answeredAssessments.assessment');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the answeredAssessment object within the user's answeredAssessments array
        const answeredAssessment = user.answeredAssessments.find(aa => aa.assessment._id.toString() === assessmentId);

        if (!answeredAssessment) {
            return res.status(404).json({ error: 'Answered assessment not found' });
        }

        // Ensure answeredAssessment.answers is initialized as an array
        if (!answeredAssessment.answers) {
            answeredAssessment.answers = [];
        }

        // Loop through each answer
        for (const answer of answers) {
            const { id: questionId, answerId } = answer;
            console.log(`Processing answer for questionId ${questionId} with answerId ${answerId}`);

            // Log the questionId received to ensure it matches the expected format
            console.log("Received questionId:", questionId);

            // Ensure questionId is not undefined
            if (!questionId) {
                return res.status(400).json({ error: 'Question ID is missing in the request' });
            }

            // Find the question in the assessment's questions array
            const questionInAssessment = answeredAssessment.assessment.questions.find(q => q._id.toString() === questionId);

            if (!questionInAssessment) {
                return res.status(404).json({ error: `Question with ID ${questionId} not found in the assessment` });
            }

            // Process the answer based on the question type

            // Check if the question type is 'personalAnswers'
            if (questionInAssessment.type === 'personalAnswers') {
                // Save personal answer
                answeredAssessment.answers.push({ question: questionId, answer: answerId });
            } else if (questionInAssessment.type === 'options') {
                // Find the selected option
                const option = questionInAssessment.options.find(opt => opt._id.toString() === answerId);
                if (!option) {
                    return res.status(400).json({ error: `Invalid answer option for question: ${questionInAssessment.text}` });
                }
                // Save the selected option
                answeredAssessment.answers.push({ question: questionId, answer: option.text });
            }
        }

        // Save user with updated answeredAssessment
        await user.save();

        res.json({ message: "Answers submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// View assessment results and answers
userRouter.get("/user/assessments/:assessmentId/results", auth, async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        const results = assessment.results;
        const answers = assessment.answers;

        res.json({ results, answers });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
userRouter.post("/user/assessments/:assessmentId/cancel", auth, async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // flag 'cancelled' is set to true in the assessment document
        assessment.cancelled = true;
        await assessment.save();

        res.json({ message: "Assessment canceled successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = userRouter;
