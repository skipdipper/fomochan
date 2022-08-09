const Post = require('../models/post');
const Thread = require('../models/thread');
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
            const thumbnail = await imageProcessor.imageResize('./' + req.file.path, true);
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
            if (validThread(req.body.thread_id)) {
                await Post.create(
                    {
                        post_id: newPostId,
                        ...req.body, // comment, thread_id
                        ...file
                    }
                );

                if (req.body.quotePostIds) {
                    addReply(newPostId, parseInt(req.body.quotePostIds[0]));
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
async function validThread(threadId) {
    const thread = Thread.findOne({ 'post_id': threadId })
        .lean()
        .exec();

    return thread;
}


async function addReply(postFrom, postTo) {
    const added = await Post.updateOne(
        { post_id: postTo },
        { $push: { replies: postFrom } },

    );
    console.log(`post from No. ${postFrom} added to post No${postTo} replies`);
    console.log(`posts modified: ${added.modifiedCount}`);
}


// Display Post delete form on GET.
exports.post_delete = [
    // admin auth

    async (req, res) => {
        try {
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

