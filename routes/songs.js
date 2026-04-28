const router = require('express').Router();
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require login
router.use(auth);

// ================================
// GET ALL SONGS (with search & filter)
// GET /api/songs
// GET /api/songs?search=yesu
// GET /api/songs?key=G&language=telugu
// ================================
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Search by title or artist
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { artist: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by key
    if (req.query.key) {
      query.key = req.query.key;
    }

    // Filter by language
    if (req.query.language) {
      query.language = req.query.language;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    const songs = await Song.find(query).sort({ title: 1 });
    res.json({
      count: songs.length,
      songs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// GET ONE SONG
// GET /api/songs/:id
// ================================
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// ADD A SONG
// POST /api/songs
// Admin and member only
// ================================
router.post('/', authorize('admin', 'member'), async (req, res) => {
  try {
    const { title, artist, key, tempo, language, category, lyricsUrl, notes } = req.body;

    if (!title || !key) {
      return res.status(400).json({
        message: 'Please provide at least a title and key'
      });
    }

    const newSong = new Song({
      title,
      artist,
      key,
      tempo,
      language,
      category,
      lyricsUrl,
      notes,
      addedBy: req.user.id
    });

    const saved = await newSong.save();
    res.status(201).json({
      message: 'Song added successfully!',
      song: saved
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// UPDATE A SONG
// PUT /api/songs/:id
// Admin and member only
// ================================
router.put('/:id', authorize('admin', 'member'), async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json({
      message: 'Song updated successfully!',
      song
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================================
// DELETE A SONG
// DELETE /api/songs/:id
// Admin only
// ================================
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json({
      message: `"${song.title}" has been removed`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;