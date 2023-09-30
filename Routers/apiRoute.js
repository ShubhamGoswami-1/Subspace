const express = require('express');
const apiController = require('./../Controllers/apiController');

const router = express.Router();

router.get('/blog-stats', apiController.fetchingBlogDataAnalysis);
router.get('/blog-search', apiController.blogSearch);

module.exports = router;