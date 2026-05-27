const express = require("express");
const { createSessions, getSessionById, getMySessions, deleteSessions } = require("../controllers/sessionController");
const {protect} = require("../middlewares/authMiddleware");
// const { create } = require("../models/User");

const router = express.Router();


router.post('/create', protect, createSessions);

router.get('/my-sessions', protect, getMySessions);

router.get('/:id', protect, getSessionById);

router.delete('/:id', protect, deleteSessions);


module.exports = router;