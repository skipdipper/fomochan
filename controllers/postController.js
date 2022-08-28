const { getPostCollection } = require('../models/post');
const { getThreadCollection } = require('../models/thread');
const Counter = require('../models/counter');

const { nextSequence } = require('../services/generate-id.service');

const { upload } = require('../services/file-upload.service');
const imageProcessor = require('../services/image-resize.service')
const path = require('path');


const { body, validationResult } = require("express-validator");
const { isNestedPost } = require('../middleware/nested-post.middleware');


// // Handle Post create on POST.
exports.post_create = [
    upload.single('file'),

    isNestedPost,

    // Validate and sanitize the name field.
    // body('comment', 'comment required').trim().isLength({ min: 1 }).escape(),

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
            const thumbnail = await imageProcessor.imageResize('./' + req.file.path);
            console.log(thumbnail);

            file = {
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
        const newPostId = await nextSequence();

        // Create a Post with escaped and trimmed data.
        try {
            if (validThread(req.body.thread_id, req.baseUrl)) {
                const Post = getPostCollection(req.baseUrl);
                await Post.create(
                    {
                        post_id: newPostId,
                        ...req.body, // comment, thread_id
                        ...file
                    }
                );

                if (req.body.quotePostIds) {
                    if (req.body.quotePostIds[0] == req.body.thread_id) {
                        addReplyToOP(newPostId, parseInt(req.body.quotePostIds[0]), req.baseUrl);
                    } else {
                        addReply(newPostId, parseInt(req.body.quotePostIds[0]), req.baseUrl);
                    }
                    // addReply(newPostId, parseInt(req.body.quotePostIds[0]));
                }

                updateThreadReplyCount(req.body.thread_id, req.baseUrl);
                if (req.file) {
                    updateThreadImageCount(req.body.thread_id, req.baseUrl);
                }

                res.status(201).send('Post Successful!');
                return;
            }

        } catch (error) {
            // or invalid form check
            console.log(error);

            return res.status(400).send('Replying to a Thread that does not Exist');
        }

    }
];


//Check if the given Thread exists
async function validThread(threadId, board) {
    const Thread = getThreadCollection(board);
    const thread = Thread.findOne({ 'post_id': threadId })
        .lean()
        .exec();

    return thread;
}

async function updateThreadReplyCount(threadId, board) {
    filter = { 'post_id': threadId };
    update = { $inc: { replies: 1 } };

    const Thread = getThreadCollection(board);
    const res = await Thread.updateOne(filter, update);
    console.log(`Reply count updated: ${res.acknowledged}`);
}

async function updateThreadImageCount(threadId, board) {
    filter = { 'post_id': threadId };
    update = { $inc: { images: 1 } };

    const Thread = getThreadCollection(board);
    const res = await Thread.updateOne(filter, update);
    console.log(`Image count updated: ${res.acknowledged}`);
}


async function addReply(postFrom, postTo, board) {
    const Post = getPostCollection(board);
    const added = await Post.updateOne(
        { post_id: postTo },
        { $push: { replies: postFrom } },

    );
    console.log(`post from No. ${postFrom} added to post No${postTo} replies`);
    console.log(`posts modified: ${added.modifiedCount}`);
    console.log(`Reply pushed: ${added.acknowledged}`);
}

async function addReplyToOP(postFrom, postTo, board) { 
    const Thread = getThreadCollection(board);
    const added = await Thread.updateOne(
        { post_id: postTo },
        { $push: { last_replies: postFrom } },

    );
    console.log(`post from No. ${postFrom} added to post No${postTo} replies`);
    console.log(`posts modified: ${added.modifiedCount}`);
    console.log(`Reply pushed: ${added.acknowledged}`);
}


// Display Post delete form on GET.
exports.post_delete = [
    // admin auth

    async (req, res) => {
        try {
            const Post = getPostCollection(req.baseUrl);
            deleted = await Post.deleteOne({ post_id: req.params.id });

            if (deleted.deleteCount == 0) {
                return res.status(404).json({ message: `Post No. ${req.params.id} not found` })
            }
            return res.status(200).json({ message: `Deleted Post No. ${req.params.id}` })


        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

    }

]



// Display Post update form on GET.
exports.post_update = function (req, res) {
    res.send('NOT IMPLEMENTED: Post update');
};

