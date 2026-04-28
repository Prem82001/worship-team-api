const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    trim: true
  },
  key: {
    type: String,
    enum: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
           'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'],
    required: true
  },
  tempo: {
    type: Number,
    min: 40,
    max: 240
  },
  language: {
    type: String,
    enum: ['telugu', 'english', 'hindi', 'tamil', 'other'],
    default: 'telugu'
  },
  category: {
    type: String,
    enum: ['worship', 'praise', 'hymn', 'offering', 'communion', 'christmas', 'easter', 'other'],
    default: 'worship'
  },
  lyricsUrl: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Song', songSchema);