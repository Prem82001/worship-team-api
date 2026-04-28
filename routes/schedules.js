const router = require('express').Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require login
router.use(auth);

// ================================
// GET ALL SCHEDULES
// GET /api/schedules
// ================================
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Filter by month and year
    if (req.query.month && req.query.year) {
      const startDate = new Date(req.query.year, req.query.month - 1, 1);
      const endDate = new Date(req.query.year, req.query.month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('setlist', 'title')
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('createdBy', 'username')
      .sort({ date: 1 });

    res.json({
      count: schedules.length,
      schedules
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// GET ONE SCHEDULE
// GET /api/schedules/:id
// ================================
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('setlist')
      .populate('team.vocals', 'name role phone')
      .populate('team.musicians.member', 'name role phone')
      .populate('team.ppt', 'name phone')
      .populate('createdBy', 'username');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// CREATE A SCHEDULE
// POST /api/schedules
// Admin and member only
// ================================
router.post('/', authorize('admin', 'member'), async (req, res) => {
  try {
    const { date, title, setlist, team, notes } = req.body;

    if (!date || !title) {
      return res.status(400).json({
        message: 'Please provide a date and title'
      });
    }

    const newSchedule = new Schedule({
      date,
      title,
      setlist,
      team,
      notes,
      createdBy: req.user.id
    });

    const saved = await newSchedule.save();

    const populated = await Schedule.findById(saved._id)
      .populate('setlist', 'title')
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('createdBy', 'username');

    res.status(201).json({
      message: 'Schedule created successfully!',
      schedule: populated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// UPDATE A SCHEDULE
// PUT /api/schedules/:id
// Admin and member only
// ================================
router.put('/:id', authorize('admin', 'member'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('setlist', 'title')
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('createdBy', 'username');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      message: 'Schedule updated successfully!',
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// DELETE A SCHEDULE
// DELETE /api/schedules/:id
// Admin only
// ================================
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      message: `Schedule "${schedule.title}" has been removed`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;