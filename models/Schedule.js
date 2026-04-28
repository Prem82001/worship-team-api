const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  setlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setlist'
  },
  team: {
    vocals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    }],
    musicians: [{
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
      },
      instrument: {
        type: String,
        trim: true
      }
    }],
    ppt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    bibleReading: {
      type: String,
      trim: true
    },
    biblePassage: {
      type: String,
      trim: true
    },
    offeringSong: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);