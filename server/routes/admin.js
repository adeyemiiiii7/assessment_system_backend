const express = require("express");
const adminRouter = express.Router();
const admin = require("../middleware/admin");
const Assessment = require("../models/assessment");
const { Question, questionSchema } = require("../models/questions");
const User = require("../models/user");

//add assessment
adminRouter.post('/admin/add-assessment', admin, async (req, res) => {
  try {
    const { title } = req.body;
    const { firstname, lastname } = req.user; 
  
    const assessment = new Assessment({
      title,
      firstname,
      lastname,
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
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const questions = assessment.questions;
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

    // Constructing the responseData object
    const responseData = [];
    users.forEach(user => {
      user.answeredAssessments.forEach(answeredAssessment => {
        const assessmentTitle = answeredAssessment.assessment.title;
        const userResponse = {
          firstname: user.firstname,
          lastname: user.lastname,
          answers: answeredAssessment.answers
        };
        // Check if the assessment title already exists in responseData
        const existingAssessment = responseData.find(item => item.title === assessmentTitle);
        if (existingAssessment) {
          existingAssessment.users.push(userResponse);
        } else {
          responseData.push({
            title: assessmentTitle,
            users: [userResponse]
          });
        }
      });
    });

    res.json(responseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// Get the number of assessments available
adminRouter.get('/admin/assessments/count', admin, async (req, res) => {
  try {
    const count = await Assessment.countDocuments();
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get the number of assessments created by the currently authenticated admin
adminRouter.get('/admin/assessments/count/specfic-admin', admin, async (req, res) => {
  try {
    const { firstname, lastname } = req.user;
    
    // Count the number of assessments created by the currently authenticated admin
    const count = await Assessment.countDocuments({ firstname, lastname });
    
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = adminRouter;
