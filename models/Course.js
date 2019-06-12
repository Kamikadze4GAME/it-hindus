'use strict';

const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: String,

  active: { type: Boolean, required: true, default: true },
  video: String,

}, { timestamps: true });

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: String,

  active: { type: String, required: true, default: true },
  video: String,
  lessons: [LessonSchema],

}, { timestamps: true });


const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: String,

  active: { type: String, required: true, default: true },
  modules: [ModuleSchema],

  liked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      progress: [{
        moduleID: {type:Schema.Types.ObjectId, required: true},
        progress: {type: Number, default: 0}
      }],
      date: { type: Date, default: Date.now }
    }
  ],

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });


CourseSchema.methods.setProgress = function setProgress(moduleID, user, progress) {
  // this.members.
  // for(member of this.members) {
  //   if(String(member.user._id) !== String(user._id)) {
  //     for(prog of member.progress) {
  //       if(String(prog.moduleID) === String(moduleID)) {
  //         prog.progress = progress;
  //       }
  //     }
  //   }
  // }


  // var finded = false;
  this.members
    .filter(member => String(member.user._id) !== String(member._id))
    .forEach(member => {
      var finded1 = false;

      member.progress
        .filter(prog => {
          return String(prog.moduleID) === String(moduleID);
        })
        .forEach(prog => {
          finded1 = true;
          prog.progress = Number.parseFloat(progress)
        });

      if(!finded1) {
        member.progress.push({
          moduleID: moduleID,
          progress: progress
        })
      }
    });

  return this.save();
};
CourseSchema.methods.isFavorite = function isFavorite(user) {
  if(user && Array.isArray(user.favorites)) {
    for(let i = 0; i < user.favorites; i++) {
      if(String(user.favorites[i]._id) === String(this._id)) {
        return true;
      }
    }
  }
  return false;
};
CourseSchema.methods.isMember = function isMember(user) {
  return this.members.filter((_) => {
    return String(_.user._id) === String(user._id);
  }).length !== 0;
}

CourseSchema.methods.accept = function accept(user) {
  this.members.push({
    user: user
  });
  return this.save();
}

CourseSchema.methods.unaccept = function unaccept(user) {
  this.members = this.members.filter(_ => String(_.user._id) !== String(user._id));
  return this.save();
}

CourseSchema.methods.like = function like(user) {
  this.liked.push(user._id);
  return this.save();
}

CourseSchema.methods.unlike = function unlike(user) {
  this.liked.remove(user._id);
  return this.save();
}


CourseSchema.pre('find', function() {
  this
    // .populate('modules')
    // .populate('modules.lessons')
    .populate('createdBy')
    .populate('members.user', '-favorites')
  ;
});

CourseSchema.pre('findOne', function() {
  this
    .populate('createdBy')
    .populate('members.user')
  ;
});


const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;
