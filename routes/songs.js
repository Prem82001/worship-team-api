const router = require('express').Router();
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// PUBLIC - GET ALL SONGS
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { artist: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.key) query.key = req.query.key;
    if (req.query.language) query.language = req.query.language;
    if (req.query.category) query.category = req.query.category;
    const songs = await Song.find(query).sort({ title: 1 });
    res.json({ count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUBLIC - GET ONE SONG
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN/MEMBER - CREATE
router.post('/', auth, authorize('admin', 'member'), async (req, res) => {
  try {
    const { title, artist, key, tempo, language, category, lyricsUrl, notes } = req.body;
    if (!title || !key) {
      return res.status(400).json({ message: 'Please provide at least a title and key' });
    }
    const newSong = new Song({ title, artist, key, tempo, language, category, lyricsUrl, notes, addedBy: req.user.id });
    const saved = await newSong.save();
    res.status(201).json({ message: 'Song added successfully!', song: saved });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN/MEMBER - UPDATE
router.put('/:id', auth, authorize('admin', 'member'), async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ message: 'Song updated successfully!', song });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN ONLY - DELETE
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ message: `"${song.title}" has been removed` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;