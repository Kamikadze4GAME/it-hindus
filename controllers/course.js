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

  console.log(req.body);

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
  console.log('saving...');
  return course.save()
    .then(_ => {
      req.flash('success', { msg: 'Course created!' });
      return res.redirect('/courses/'+_._id);
    })
    .catch(_ => next(_))
};


exports.deleteCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.deleteOne({_id: mongodb.ObjectID(req.params.course_id)})
    // .populate('createdBy modules')
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
      }
      else {
        req.flash('success', [{msg: `Course was deleted! ID: ${req.params.course_id}`}]);
      }
      return res.redirect('/courses');
    })
    .catch(_ => next(_))
    ;
};

exports.deleteModule = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.findOneAndUpdate(
    {_id: mongodb.ObjectID(req.params.course_id)},
    {
      $pull: {
        modules: mongodb.ObjectID(req.params.module_id)
      }
    }
  )
    // .populate('createdBy modules')
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
      }
      else {
        req.flash('success', [{msg: `Module was deleted! ID: ${req.params.module_id}`}]);
      }
      return res.redirect('/courses/'+req.params.course_id);
    })
    .catch(_ => next(_))
    ;
};


exports.getEditCourse = (req, res, next) => {
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

      return res.render('course/edit', {
        // title: 'Courses',
        course: course
      });
    })
    .catch(_ => next(_))
    ;
};

exports.postEditCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  req.assert('title', 'Title is required').len(3);


  const errors = req.validationErrors();

  return Course.updateOne(
    {_id: mongodb.ObjectID(req.params.course_id)},
    {
      title: req.body.title,
      desc: req.body.desc,
    }
  )
    // .populate('createdBy modules')
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
        return res.redirect('/courses');
      }

      req.flash('success', [{msg: `Course was updated! ID: ${req.params.course_id}`}]);

      return res.redirect('/courses/'+course._id);

    })
    .catch(_ => next(_))
    ;
};

exports.postAddModule = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  req.assert('title', 'Title is required').len(3);

  const id = mongodb.ObjectID();
  const name = 'courses/'+req.params.course_id+'/modules/'+id+'___'+encodeURI(req.file.originalname);
  let errors;

  return Promise.resolve()
    .then(_ => {
      return req.app.locals.s3.putObject("test", name, req.file.buffer);
    })
    .then(etag => {
      errors = req.validationErrors();

      return Course.findOneAndUpdate(
        {_id: mongodb.ObjectID(req.params.course_id)},
        {
          $push: {
            modules: {
              _id: id,
              title: req.body.title,
              desc: req.body.desc,
              video: name
            }
          }
        }
      )
    })
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
        return res.redirect('/courses');
      }

      req.flash('success', [{msg: `Course was updated! ID: ${req.params.course_id}`}]);

      return res.redirect('/courses/'+course._id);

    })
    .catch(_ => next(_))
    ;
};
