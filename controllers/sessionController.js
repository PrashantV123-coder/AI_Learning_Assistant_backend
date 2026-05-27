const Session = require("../models/Session");
const Question = require("../models/Question");

// @desc Create a new session and linked questions
// @route POST /api/sessions/create
// @access Private
exports.createSessions = async (req, res) => {
  try {
    console.log("SESSION BODY:", req.body);
    console.log("REQ USER:", req.user);

    const { role, experience, topicsToFocus, description, questions } =
      req.body;

    // Validate logged in user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions must be a non-empty array",
      });
    }

    // Create session
    const session = await Session.create({
      user: req.user._id,
      role,
      experience: Number(experience),
      topicsToFocus,
      description,
      questions: [],
    });

    // Create questions
    const createdQuestions = await Question.insertMany(
      questions.map((q) => ({
        session: session._id,
        question: q.question || "",
        answer: q.answer || "",
      })),
    );

    // Save question ids
    session.questions = createdQuestions.map((q) => q._id);

    await session.save();

    // Populate questions before returning
    const populatedSession = await Session.findById(session._id).populate(
      "questions",
    );

    res.status(201).json({
      success: true,
      session: populatedSession,
    });
  } catch (error) {
    console.error("CREATE SESSION ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all sessions for logged-in user
// @route GET /api/sessions/my-sessions
// @access Private
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("questions");

    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get session by id
// @route GET /api/sessions/:id
// @access Private
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate({
      path: "questions",
      options: {
        sort: {
          isPinned: -1,
          createdAt: 1,
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Delete session
// @route DELETE /api/sessions/:id
// @access Private
exports.deleteSessions = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await Question.deleteMany({
      session: session._id,
    });

    await session.deleteOne();

    res.status(200).json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
