'use strict';

const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new mongoose.Schema({
  title: String,
  description: String,

  active: Boolean,
  video: String,

}, { timestamps: true });

const ModuleSchema = new mongoose.Schema({
  title: String,
  description: String,

  active: Boolean,
  lessons: [LessonSchema],

}, { timestamps: true });


const CourseSchema = new mongoose.Schema({
  title: String,
  desc: String,

  active: Boolean,
  modules: [ModuleSchema],

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });






CourseSchema.pre('find', function() {
  this.populate('modules').populate('createdBy');
});
CourseSchema.pre('findOne', function() {
  this.populate('modules').populate('createdBy');
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;
//
//
// var a = new Course({
//   title: 'Course title',
//   desc: 'desc',
//   createdBy: mongodb.ObjectID(),
//   modules: [
//     {
//       title: 'First module',
//       lessons: [
//         {
//           title: 'First lesson'
//         }
//       ]
//     }
//   ]
// });
//
// // console.log(JSON.stringify(a, null, 2));
//
// a.modules[1] = {
//   title: 'Second module',
//   lessons: [
//     {
//       title: 'First lesson'
//     }
//   ]
// };
//
//
// console.log(JSON.stringify(a, null, 2));
//
// [a.modules[0], a.modules[1]] = [a.modules[1], a.modules[0]]
//
// console.log(JSON.stringify(a, null, 2));
//
//
// a.save().then(_ => {
//     console.log(_);
//   })
//   .catch(err => console.log(err))
