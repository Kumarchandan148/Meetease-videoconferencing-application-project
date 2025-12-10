const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const auth = require("../middleware/auth");
const router = express.Router();

// Create room
router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const roomId = uuidv4().substring(0, 9);

    const room = await Room.create({
      roomId,
      name,
      host: req.user.id,
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join room
router.post("/join/:roomId", auth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Add participant if not already in room
    const existingParticipant = room.participants.find(
      (p) => p.user.toString() === req.user.id
    );

    if (!existingParticipant) {
      room.participants.push({ user: req.user.id });
      await room.save();
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get room details
router.get("/:roomId", auth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId })
      .populate("host", "name email")
      .populate("participants.user", "name email");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
