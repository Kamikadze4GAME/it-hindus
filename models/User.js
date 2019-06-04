const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Course = require('./Course');

const userSchema = new mongoose.Schema({
  isAdmin: { type: Boolean, deafult: false },
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  favorites: [{ type: Schema.Types.ObjectId, ref: 'Course' }],

  profile: {
    firstname: String,
    lastname: String,
    group: String,

    picture: String
  }
}, { timestamps: true });

userSchema.pre('find', function() {
  // this.favorites = this.likedCourses();
  this
    // .populate('modules')
    // .populate('modules.lessons')
    .populate('favorites')
    ;
});
userSchema.pre('findOne', function() {
  // this.favorites = this.likedCourses();
  this.populate('favorites');
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

userSchema.methods.likedCourses = function likedCourses() {
  return Course.find({liked: this._id}).populate('liked').exec();
};

// userSchema.methods.favoriteCourse = function favoriteCourse(courseID) {
//   this.favorites.push(courseID);
//   return this.save();
// };
// userSchema.methods.unfavoriteCourse = function unfavoriteCourse(courseID) {
//   this.favorites.remove(courseID);
//   return this.save();
// };

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
