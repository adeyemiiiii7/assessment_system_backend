const express = require("express");
const adminRouter = express.Router();
const admin = require("../middleware/admin");
const Assessment = require("../models/assessment");
const { Question, questionSchema } = require("../models/questions");
const User = require("../models/user");
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
adminRouter.post('/admin/add-question/:assessmentId', admin, async (req, res) => {
  try {
    const { text, type, options, personalAnswer } = req.body;
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const question = new Question({
      text,
      type,
      options,
      personalAnswer
    });
    // Add the question to the assessment's questions array
    assessment.questions.push(question);
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
    // delete all questions associated with the assessment
    await Question.deleteMany({ assessment: id });
    res.json(assessment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Question from Assessment
adminRouter.post('/admin/delete-question/:assessmentId', admin, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { id: questionId } = req.body;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    // Find the question by ID and remove it from the assessment's questions array
    const index = assessment.questions.findIndex(q => q._id.toString() === questionId);
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }
    assessment.questions.splice(index, 1);
    await assessment.save();
    await Question.findByIdAndDelete(questionId);

    res.json({ message: 'Question deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get('/admin/user-assessments', admin, async (req, res) => {
  try {
    // Query the User collection to get users along with their answered assessments
    const users = await User.find({ 'answeredAssessments': { $exists: true, $ne: [] } }, 'firstname lastname answeredAssessments')
      .populate({
        path: 'answeredAssessments',
        populate: {
          path: 'assessment',
          select: 'title questions',
          populate: {
            path: 'questions',
            select: 'text options personalAnswer'
          }
        }
      });
    const responseData = users.map(user => {
      return {
        firstname: user.firstname,
        lastname: user.lastname,
        assessments: user.answeredAssessments.map(answeredAssessment => {
          return {
            title: answeredAssessment.assessment.title,
            answers: answeredAssessment.answers
          };
        })
      };
    });
    res.json(responseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



module.exports = adminRouter;
