const express = require('express');
const router = express.Router();

// Require controller modules.
const thread_controller = require('../controllers/threadController');
const post_controller = require('../controllers/postController');

/// THREAD ROUTES ///


// GET catalog home page.
// router.get('/', thread_controller.index);


// GET request for retrieving list of all Threads.
router.get('/threads', thread_controller.thread_list);

router.get('/threads/:query', thread_controller.thread_search);

// POST request for creating Thread.
router.post('/thread', thread_controller.thread_create);

router.delete('/thread/:id', thread_controller.thread_delete);

// GET request for retrieving a single Thread.
router.get('/thread/:id', thread_controller.thread_replies);

// Delete request to delete a Thread.
router.delete('/thread/:id', thread_controller.thread_delete);

// Put request to update Thread.
router.put('/thread/:id', thread_controller.thread_update);



/// Post ROUTES ///
router.post('/post', post_controller.post_create);

router.delete('/post/:id', post_controller.post_delete);

router.post('/upload', thread_controller.upload_file);



module.exports = router;
