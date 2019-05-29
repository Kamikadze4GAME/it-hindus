
const Course = require('../models/Course');
const mongodb = require('mongodb');

/**
 * GET /
 * Home page.
 */
 exports.index = (req, res, next) => {

  Course.find({}).populate('createdBy')
     .then(courses => {
       // console.log('courses', courses);

       return res.render('home', {
         title: 'Home',
         courses: courses || []
       });
     })
     .catch(_ => next(_))
     ;
 };
