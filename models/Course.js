

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,

  active: Boolean,
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
