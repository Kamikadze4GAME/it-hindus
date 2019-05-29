const { promisify } = require('util');
const _ = require('lodash');
const Course = require('../models/Course');
const mongodb = require('mongodb');
/**
 * GET /courses
 */
exports.getCourseList = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.find()
    // .populate('createdBy modules')
    .then(courses => {
      // console.log('courses/list', courses);

      return res.render('course/list', {
        // title: 'Courses',
        courses: courses
      });
    })
    .catch(_ => next(_))
    ;
}

exports.getCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)})
    // .populate('createdBy modules')
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
        return res.redirect('/courses');
      }


      return res.render('course/full', {
        // title: 'Courses',
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

exports.getCreateCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return res.render('course/create', {
    title: 'New course',
    // courses: courses || []
  });
};

exports.postCreateCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  req.assert('title', 'Title is required').len(3);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/course/create');
  }

  const course = new Course({
    title: req.body.title,
    desc: req.body.desc,
    createdBy: req.user._id
  });

  return course.save()
    .then(_ => {
      console.log(_);
    })
    .catch(_ => next(_))
};
