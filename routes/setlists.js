const router = require('express').Router();
const Setlist = require('../models/Setlist');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// PUBLIC - GET ALL
router.get('/', async (req, res) => {
  try {
    const setlists = await Setlist.find()
      .populate('songs.song', 'title artist key tempo lyricsUrl')
      .populate('createdBy', 'username')
      .sort({ date: -1 });
    res.json({ count: setlists.length, setlists });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUBLIC - GET ONE
router.get('/:id', async (req, res) => {
  try {
    const setlist = await Setlist.findById(req.params.id)
      .populate('songs.song', 'title artist key tempo language category lyricsUrl')
      .populate('createdBy', 'username');
    if (!setlist) return res.status(404).json({ message: 'Setlist not found' });
    res.json(setlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN/MEMBER - CREATE
router.post('/', auth, authorize('admin', 'member'), async (req, res) => {
  try {
    const { title, date, songs, notes } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'Please provide a title and date' });
    }
    const newSetlist = new Setlist({ title, date, songs, notes, createdBy: req.user.id });
    const saved = await newSetlist.save();
    const populated = await Setlist.findById(saved._id)
      .populate('songs.song', 'title artist key tempo lyricsUrl')
      .populate('createdBy', 'username');
    res.status(201).json({ message: 'Setlist created successfully!', setlist: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN/MEMBER - UPDATE
router.put('/:id', auth, authorize('admin', 'member'), async (req, res) => {
  try {
    const setlist = await Setlist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('songs.song', 'title artist key tempo lyricsUrl')
      .populate('createdBy', 'username');
    if (!setlist) return res.status(404).json({ message: 'Setlist not found' });
    res.json({ message: 'Setlist updated successfully!', setlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN ONLY - DELETE
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const setlist = await Setlist.findByIdAndDelete(req.params.id);
    if (!setlist) return res.status(404).json({ message: 'Setlist not found' });
    res.json({ message: `Setlist "${setlist.title}" has been removed` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;