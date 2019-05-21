const { promisify } = require('util');

const axios = require('axios');

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('admin/index', {
    title: 'Admin'
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('admin/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/admin/upload');
};
