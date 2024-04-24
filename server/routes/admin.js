const express = require("express");
const adminRouter = express.Router();
const admin = require("../middleware/admin");
const Assessment = require("../models/assessment");
const {Question, questionSchema} = require("../models/questions");


// Add Assessment
adminRouter.post('/admin/add-assessment', admin, async (req, res) => {
  try {
    const { title } = req.body;
    const assessment = new Assessment({
      title
    });
    await assessment.save();
    res.json(assessment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Add Question to Assessment
// add-question route handler
adminRouter.post('/admin/add-question/:assessmentId', admin, async (req, res) => {
    try {
        const { text, type, options, personalAnswer } = req.body;
        const { assessmentId } = req.params;

        // Find the assessment by ID
        const assessment = await Assessment.findById(assessmentId);

        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

       

        // Create the question
        const question = new Question({
            text,
            type,
            options,
            personalAnswer
        });

        // Add the question to the assessment's questions array
        assessment.questions.push(question);

        // Save the assessment
        await assessment.save();

        res.json(question);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get All Assessments
adminRouter.get('/admin/get-assessments', admin, async (req, res) => {
  try {
    const assessments = await Assessment.find({});
    res.json(assessments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Questions of an Assessment
adminRouter.get('/admin/get-questions/:assessmentId', admin, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const questions = await Question.find({ assessment: assessmentId });
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Assessment
adminRouter.post('/admin/delete-assessment', admin, async (req, res) => {
  try {
    const { id } = req.body;
    const assessment = await Assessment.findByIdAndDelete(id);
    // Also delete all questions associated with the assessment
    await Question.deleteMany({ assessment: id });
    res.json(assessment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Question
adminRouter.post('/admin/delete-question', admin, async (req, res) => {
  try {
    const { id } = req.body;
    const question = await Question.findByIdAndDelete(id);
    res.json(question);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = adminRouter;
