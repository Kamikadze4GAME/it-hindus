

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,

  active: Boolean,
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
