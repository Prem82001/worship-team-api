const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(auth);

// GET all schedules
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('team.soundEngineer', 'name')
      .populate('team.streamingOperator', 'name')
      .populate({
        path: 'setlist',
        populate: {
          path: 'songs.song'
        }
      })
      .sort({ date: 1 });

    res.json({ count: schedules.length, schedules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('team.soundEngineer', 'name')
      .populate('team.streamingOperator', 'name')
      .populate({
        path: 'setlist',
        populate: {
          path: 'songs.song'
        }
      });

    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create schedule
router.post('/', authorize('admin', 'member'), async (req, res) => {
  try {
    const schedule = new Schedule({
      ...req.body,
      createdBy: req.user.id
    });
    await schedule.save();

    const populated = await Schedule.findById(schedule._id)
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('team.soundEngineer', 'name')
      .populate('team.streamingOperator', 'name')
      .populate({
        path: 'setlist',
        populate: { path: 'songs.song' }
      });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update schedule
router.put('/:id', authorize('admin', 'member'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('team.vocals', 'name role')
      .populate('team.musicians.member', 'name role')
      .populate('team.ppt', 'name')
      .populate('team.soundEngineer', 'name')
      .populate('team.streamingOperator', 'name')
      .populate({
        path: 'setlist',
        populate: { path: 'songs.song' }
      });

    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE schedule
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;