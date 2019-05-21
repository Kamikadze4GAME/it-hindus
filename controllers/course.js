const { promisify } = require('util');
const _ = require('lodash');
const Course = require('../models/Course');
const mongodb = require('mongodb');
/**
 * GET /courses
 */
exports.getCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)}).populate('createdBy')
    .then(course => {
      console.log('course', course);

      return res.render('course/full', {
        title: 'Courses',
        course: course
      });
    })
    .catch(_ => next(_))
    ;
};

exports.getCourses = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.find({createdBy: req.user.id}).populate('createdBy')
    .then(courses => {
      console.log('courses', courses);

      return res.render('course/index', {
        title: 'Courses',
        courses: courses || []
      });
    })
    .catch(_ => next(_))
    ;
};

exports.getNewCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return res.render('course/new', {
    title: 'New course',
    // courses: courses || []
  });
};

exports.postNewCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  req.assert('title', 'Title is required').len(3);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/course/new');
  }

  const course = new Course({
    title: req.body.title,
    desc: req.body.desc,
    createdBy: req.user.id
  });

  return course.save()
    .then(_ => {
      console.log(_);
    })
    .catch(_ => next(_))
};
