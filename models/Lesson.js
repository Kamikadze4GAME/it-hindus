

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,

  active: Boolean,
  video: String,

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
