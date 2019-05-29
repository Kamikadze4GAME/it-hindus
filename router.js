'use strict';

const express = require('express');

const path = require('path');
const Multer = require('multer');
const upload = Multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const courseController = require('./controllers/course');
const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');



const router = express.Router();



// router.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user
//     && req.path !== '/signin'
//     && req.path !== '/signup'
//   ) {
//     req.flash('errors', { msg: 'Not authorized' });
//     return res.redirect('/signin');
//   }
//   next();
// });


/**
 * Primary router routes.
 */



router.get('/', passportConfig.isAuthenticated, homeController.index);

router.get('/signin', userController.getSignin);
router.post('/signin', userController.postSignin);

router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);

router.get('/logout', userController.logout);

router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);

router.get('/reset/:token', userController.getReset);
router.post('/reset/:token', userController.postReset);



router.get('/contact', contactController.getContact);
router.post('/contact', contactController.postContact);

router.get('/profile', passportConfig.isAuthenticated, userController.getAccount);
router.post('/profile/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
router.post('/profile/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
router.post('/profile/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);


/**
 * Courses examples routes.
 */
router.get('/courses', passportConfig.isAuthenticated, courseController.getCourseList);
router.get('/courses/create', passportConfig.isAuthenticated, courseController.getCreateCourse);
router.post('/courses/create', passportConfig.isAuthenticated, courseController.postCreateCourse);
router.get('/courses/:course_id([0-9a-fA-F]{24})', passportConfig.isAuthenticated, courseController.getCourse);
router.post('/courses/:course_id([0-9a-fA-F]{24})/delete', passportConfig.isAuthenticated, courseController.deleteCourse);

router.get('/courses/:course_id([0-9a-fA-F]{24})/edit', passportConfig.isAuthenticated, courseController.getEditCourse);
router.post('/courses/:course_id([0-9a-fA-F]{24})/edit', passportConfig.isAuthenticated, courseController.postEditCourse);


router.post('/courses/:course_id([0-9a-fA-F]{24})/modules',
  passportConfig.isAuthenticated,
  Multer({storage: Multer.memoryStorage()}).single('video'),
  courseController.postAddModule
);
router.post('/courses/:course_id([0-9a-fA-F]{24})/modules/:module_id([0-9a-fA-F]{24})/delete',
  passportConfig.isAuthenticated,
  courseController.deleteModule
);

// app.post("/upload", , function(request, response) {
//     minioClient.putObject("test", request.file.originalname, request.file.buffer, function(error, etag) {
//         if(error) {
//             return console.log(error);
//         }
//         response.send(request.file);
//     });
// });

// router.get('/api/upload', apiController.getFileUpload);
// router.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

/**
 * API examples routes.
 */
router.get('/api', apiController.getApi);
router.get('/api/upload', apiController.getFileUpload);
router.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);


module.exports = router;
