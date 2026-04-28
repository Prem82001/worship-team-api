const router = require('express').Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes below require login
router.use(auth);

// ================================
// GET ALL MEMBERS
// GET /api/members
// Anyone logged in can view
// ================================
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ name: 1 });
    res.json({
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// GET ONE MEMBER BY ID
// GET /api/members/:id
// Anyone logged in can view
// ================================
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// CREATE A MEMBER
// POST /api/members
// Only admin and member roles
// ================================
router.post('/', authorize('admin', 'member'), async (req, res) => {
  try {
    const { name, email, phone, role, notes } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        message: 'Please provide name, email, and role'
      });
    }

    const existing = await Member.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: 'A member with this email already exists'
      });
    }

    const newMember = new Member({
      name,
      email,
      phone,
      role,
      notes,
      addedBy: req.user.id
    });

    const saved = await newMember.save();
    res.status(201).json({
      message: 'Member added successfully!',
      member: saved
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// UPDATE A MEMBER
// PUT /api/members/:id
// Only admin and member roles
// ================================
router.put('/:id', authorize('admin', 'member'), async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member updated successfully!',
      member
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// DELETE A MEMBER
// DELETE /api/members/:id
// Only admin can delete
// ================================
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: `${member.name} has been removed from the team`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;