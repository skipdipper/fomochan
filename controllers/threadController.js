const { getThreadCollection } = require('../models/thread');
const { getPostCollection } = require('../models/post');

const { nextSequence } = require('../services/generate-id.service');

const { upload } = require('../services/file-upload.service');
const imageProcessor = require('../services/image-resize.service')

const { body, validationResult } = require("express-validator");
const path = require('path');

const { verifyHuman } = require('../middleware/captcha.middleware');
const { authUser, authAdmin } = require('../middleware/user-auth.middleware');


var async = require('async');

// GET list of Threads.
exports.thread_list = function (req, res) {
    const Thread = getThreadCollection(req.baseUrl);

    Thread.find({}, '-_id')
        .lean()
        .exec(function (err, list_threads) {
            if (err) { return next(err); }
            res.status(200).json(list_threads);
        });
};

// Get list of Threads matching search query
exports.thread_search = function (req, res) {
    const query = req.params.query;
    const Thread = getThreadCollection(req.baseUrl);

    // Search query matches a threads Subject or Comment
    Thread.find({ $or: [{ subject: { $regex: query, $options: 'i' } }, { comment: { $regex: query, $options: 'i' } }] }, '-_id')
        .lean()
        .exec(function (err, list_threads) {
            if (err) { return next(err); }
            res.status(200).json(list_threads);
        });
};


// Get a single Thread.
exports.thread_replies = async function (req, res, next) {
    let op = {};

    try {
        const Thread = getThreadCollection(req.baseUrl);
        const thread = await Thread.findOne({ post_id: req.params.id }, '-_id')
            .lean()
            .exec();

        if (thread) {
            op = thread;
        } else {
            return res.status(400).json({ error: 400, message: 'Thread does not Exist!' });
        }
    } catch (error) {
        return res.status(500).json({ error: 500, message: 'Internal server error!' });
    }

    const Post = getPostCollection(req.baseUrl);
    Post.find({ 'thread_id': req.params.id }, '-_id')
        .lean()
        .exec(function (err, list_replies) {
            if (err) { return next(err); }
            //Successful, so send json
            if (list_replies) {
                res.status(200).json([op, ...list_replies]);
            } else {
                res.status(400).send('Thread does not Exist')
            }
        });
};


// Create a new Thread
exports.thread_create = [
    // Multer first middleware
    upload.single('file'),
    // verifyHuman,


    // Validate and sanitize the name field.
    body('subject', 'Subject required').trim().isLength({ min: 1 }).escape(),
    // upload.single('image'),

    // Process request after validation and sanitization.
    async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // // There are errors. Render the form again with sanitized values/error messages.
            res.status(400).send('There are errors in form input');
            return;
        }

        let file = {};
        // There is File upload
        if (req.file) {
            const metadata = await imageProcessor.imageExif('./' + req.file.path);
            const thumbnail = await imageProcessor.imageResize('./' + req.file.path, true);
            console.log(thumbnail);

            file = {
                images: 1,
                filename: path.parse(req.file.originalname).name,
                height: metadata.height,
                width: metadata.width,
                thumbnail_h: thumbnail.height,
                thumbnail_w: thumbnail.width,
                ext: path.extname(req.file.originalname),
                filesize: req.file.size,
                tim: path.parse(req.file.filename).name
            }
            console.log('File uploaded!');
            console.log(req.file);
        }

        // Create a Thread with escaped and trimmed data.
        try {
            const postId = await nextSequence();
            const Thread = getThreadCollection(req.baseUrl);
            await Thread.create(
                {
                    post_id: postId,
                    ...req.body, // comment, thread_id
                    ...file
                }
            );

            res.status(201).send('A New Thread has been created');
            return;
        } catch (error) {
            console.log(error);

            return res.status(400).send('Replying to a Board that does not Exist');
        }
    }
];

// Delete a Thread
exports.thread_delete = [
    // require admin auth
    authUser,
    authAdmin,

    async (req, res, next) => {

        async.parallel({
            // Delete the Thread OP
            op: function (callback) {
                const Thread = getThreadCollection(req.baseUrl);
                Thread.deleteOne({ post_id: req.params.id })
                    .exec(callback);
            },

            // Delete all reply posts to Thread
            posts: function (callback) {
                const Post = getPostCollection(req.baseUrl);
                Post.deleteMany({ post_id: req.params.id })
                    .exec(callback);
            },

        }, function (err, results) {
            if (err) {
                console.log(err);
                // cast error in post_id not an integer because of mongoose model contraint
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            console.log(`number of Thread documents deleted: ${results.op.deletedCount}`)

            if (results.op.deletedCount == 0) { // No Document deleted, should at least be 1
                return res.status(404).json({ message: `Thread No. ${req.params.id} not found` })

            }
            if (results.posts.deletedCount == 0) { // No Document deleted
                console.log(`Thread No. ${req.params.id} had no reply posts. No reply posts were to be deleted`)
            }
            // Successful
            res.status(200).json({ message: `Deleted Thread No. ${req.params.id} and all reply posts` })
        });
    }


]

exports.upload_file = [
    upload.single('image'),
    async (req, res, next) => {
        console.log(req.file)
        res.send('File Successfully Uploaded!');
    }
];


// Update Thread
exports.thread_update = function (req, res) {
    res.send('NOT IMPLEMENTED: Thread update GET');
};


