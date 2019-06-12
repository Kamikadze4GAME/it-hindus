const { promisify } = require('util');
const _ = require('lodash');
const Course = require('../models/Course');
const User = require('../models/User');
const mongodb = require('mongodb');
const mime = require('mime');

const ALLOWED_VIDEO_TYPES = ['AVI', 'FLV', 'WMV', 'MP4', 'MOV', 'ARF'];
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
        course: course,
        liked: course.liked.includes(req.user._id)
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

  return Course.findOne(
    {_id: mongodb.ObjectID(req.params.course_id)}
  )
    // .populate('createdBy modules')
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
        return res.redirect('/courses/'+req.params.course_id);
      }

      course.modules.remove(mongodb.ObjectID(req.params.module_id));

      return course.save();
    })
    .then(_ => {
      req.flash('success', [{msg: `Module was deleted! ID: ${req.params.module_id}`}]);

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

exports.acceptCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  const errors = req.validationErrors();

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)})
    .then(course => {
      if(course) {
        return course.accept(req.user);
      }
    })
    .then(course => {

      req.flash('success', [{msg: `Now you participate this course! ID: ${req.params.course_id}`}]);

      return res.redirect('/courses/'+req.params.course_id);

    })
    .catch(_ => next(_))
    ;
};

exports.unacceptCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  const errors = req.validationErrors();

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)})
    .then(course => {
      if(course) {
        return course.unaccept(req.user);
      }
    })
    .then(course => {

      req.flash('success', [{msg: `Now you are unparticipated from this course! ID: ${req.params.course_id}`}]);

      return res.redirect('/courses/'+req.params.course_id);

    })
    .catch(_ => next(_))
    ;
};

exports.favoriteCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  const errors = req.validationErrors();

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)})
    .then(course => {
      if(course) {
        return course.like(req.user);
      }
    })
    .then(course => {

      req.flash('success', [{msg: `Course was favorited! ID: ${req.params.course_id}`}]);

      return res.redirect('/courses/'+req.params.course_id);

    })
    .catch(_ => next(_))
    ;
};


exports.unfavoriteCourse = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  const errors = req.validationErrors();

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)})
    .then(course => {
      if(course) {
        return course.unlike(req.user);
      }
    })
    .then(course => {

      req.flash('success', [{msg: `Course was favorited! ID: ${req.params.course_id}`}]);

      return res.redirect('/courses/'+req.params.course_id);

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

  // const extension = mime.getExtension(req.file.mimetype);
  let originalname = req.file.originalname.split('.');
  let extension = originalname.slice();
  extension = (extension[extension.length - 1] || 'bin').toLowerCase();

  console.log('extension', req.file.mimetype, extension);

  if(ALLOWED_VIDEO_TYPES.indexOf(extension.toUpperCase()) === -1) {
    req.flash('errors', [{msg: `Wrong video format. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`}]);
    return res.redirect('/courses/'+req.params.course_id+'/edit');
  }

  const name = 'courses/'+req.params.course_id+'/modules/'+id+'___'+encodeURI(originalname.slice(0, originalname.length-1).join('.')) + '.' + extension;
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


exports.setProgress = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }

  return Course.findOne({_id: mongodb.ObjectID(req.params.course_id)})
    .then(course => {
      if(!course) {
        req.flash('errors', [{msg: `No such course with ID: ${req.params.course_id}`}]);
        return res.redirect('/courses/'+req.params.course_id);
      }

      return course.setProgress(mongodb.ObjectID(req.params.module_id), req.user, req.params.progress);

    })
    .then(course => {
      return res.json({status:true});
    })
    .catch(_ => next(_))
    ;
};
