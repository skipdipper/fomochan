const User = require('../models/user');
const Token = require('../models/token');
const { Thread } = require('../models/thread');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const userAuth = require('../services/user-auth.service');

const { upload } = require('../services/file-upload.service');
const path = require('path');

const crypto = require("crypto");
const { sendEmail } = require('../services/send-email.service');
require('dotenv').config()

const jwt = require('jsonwebtoken');
const { rememberMe } = require('../middleware/rememberme.middleware');
const { authUser } = require('../middleware/user-auth.middleware');



exports.create_user = [
    body('email', 'Email must not be empty.').trim().isLength({ min: 6 }).escape().isEmail(),
    body('password', 'Password must not be empty.').trim().isLength({ min: 6 }).escape(),


    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).send(errors);
            return;

        }
        else {
            // Data from form is valid.
            const { email, password } = req.body;

            // Check if user already exists
            // NOT IMPLEMENTED

            const salt = 10;
            try {
                const hashedPassword = await bcrypt.hash(password, salt);

                const user = await User.create({
                    email: email,
                    password: hashedPassword
                })

                const randomToken = crypto.randomBytes(16).toString('hex');
                // Token that expires after 24hours in seconds
                await Token.create([{
                    token: randomToken,
                    user_id: user._id,
                }], { expire: 86400 })

                // Verification email to the server not client 
                //const verifyLink = `localhost:3001/user/verify/${randomToken}`
                const verifyLink = `http://140.238.206.232/api/user/verify/${randomToken}`
                const to = req.body.email;
                const subject = "Verify your Account";
                const text = `Thank you for signing up! To verify click this link: ${verifyLink}`;
                const html = `Thank you for signing up!  Click <a href=${verifyLink}>here</a> to verify`
                sendEmail(to, subject, text, html);

                res.status(201).json({
                    message: 'User Created'
                })
            } catch (err) {
                res.status(500).json({
                    error: err
                })
            }

        }
    }
];

exports.login_user = [
    rememberMe,
    body('email', 'Email must not be empty.').trim().isLength({ min: 6 }).escape().isEmail(),
    body('password', 'Password must not be empty.').trim().isLength({ min: 6 }).escape(),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(401).send(errors);
            console.log(errors);
            return;
        }

        const { email, password, rememberMe } = req.body;

        console.log(req.body);

        const response = await userAuth.authenticateUser(email, password);
        if (response.code == 200) {


            console.log(`Logged in as ${email}`);

            const accessToken = userAuth.generateAccessToken(response.user);
            // remember me is set than expire in 14days
            const refreshToken = userAuth.generateRefreshToken(response.user, rememberMe ? '14d' : '1h');

            // Set accessToken cookie on client expires in 5 minutes
            res.cookie('accessToken', accessToken, {
                maxAge: 5 * 60 * 1000, // 5 minutes in milliseconds
                httpOnly: true
            });

            // Set refresh Token
            res.cookie('refreshToken', refreshToken, {
                // maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
                maxAge: rememberMe ? 14 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000, // 1 hour in milliseconds
                httpOnly: true
            });

            if (rememberMe) res.cookie('rememberMe', true, { maxAge: 14 * 24 * 60 * 60 * 1000 });


            return res.status(200).json(response);
        } else {
            res.status(response.code).json(response);
        }
    }
]


exports.add_bookmark = [
    authUser,

    async function (req, res, next) {

        const { email, id } = req.body;
        try {
            const user = await User.findOne({ email }).exec();
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }

            const thread = await Thread.findOne({ post_id: id })
                .lean()
                .exec();

            if (!thread) {
                return res.status(404).json({ message: 'thread not found' });
            }

            if (!user.bookmarks) {
                user.bookmarks = [thread._id];
                console.log(email);
            } else {
                user.bookmarks.push(thread._id);
            }
            await user.save();
            console.log('added thread to bookmarks');


            return res.status(201).json({ message: 'added thread to bookmarks' });


        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
]

exports.delete_bookmark = async function (req, res, next) {

    try {

        const thread = await Thread.findOne({ post_id: req.params.postid }, '_id')
            .lean()
            .exec();
        if (thread === null) return res.status(400).json({ message: 'Book marked thread not found' });

        console.log(`bookedmarked thread No. ${req.params.postid} to delete with id: ${thread._id}`);

        // const deleted = await User.updateOne({ email: req.user.email }, {
        const deleted = await User.updateOne({ email: 'user1@gmail.com' }, {
            $pullAll: {
                bookmarks: [{ _id: thread._id }],
            },
        });
        console.log(`number of documents modifed: ${deleted.modifiedCount}`);

        if (deleted.modifiedCount) {
            console.log('bookmarked deleted');
            return res.status(200).json({ message: 'Bookmark deleted' });

        } else {
            return res.status(400).json({ message: 'No user or bookmark found, bookmark does not exist' });

        }
    } catch (error) {
        console.log(error);
        return res.status(500).end();

    }

}

exports.get_bookmark = [
    // authUser,

    async function (req, res, next) {

        // User.findOne({ email: req.user.email }, 'bookmarks -_id')
        User.findOne({ email: 'user1@gmail.com' }, 'bookmarks -_id')

            .populate('bookmarks')
            .lean()
            .exec(function (err, bookmarks) {
                // if (err) { return next(err); }
                if (err) { return res.status(501).json({ message: 'Could not retrieve bookmarks for User' }); }
                if (bookmarks === null) { return res.status(400).json({ message: 'Could not find User' }); }
                return res.status(200).json(bookmarks.bookmarks); // remove bookmark key
            });
    }

]

exports.logout_user = function (req, res, next) {
    res.clearCookie('accessToken', '', {
        maxAge: 0,
        httpOnly: true,
    });

    res.clearCookie('refreshToken', '', {
        maxAge: 0,
        httpOnly: true,
    });

    return res.status(200).json({ message: 'user logged out' });
}

exports.update_user = [
    upload.fields(
        [
            {
                name: 'pfp', maxCount: 1
            }, {
                name: 'background', maxCount: 1
            }
        ]
    ),

    async (req, res, next) => {
        if (req.files && Object.keys(req.files).length) {
            const { pfp, background } = req.files;

            console.log(req.files);
            console.log(req.body);

            if (req.files.background) {
                console.log('background update');
            }

            try {
                const user = await User.findOne({ email: req.body.email }).exec();

                // set user pfp and background
                if (user) {
                    // user.pfp = path.parse(pfp[0].filename).name;
                    // user.background = path.parse(background[0].filename).name

                    // save file names with extension
                    if (req.files.pfp) user.pfp = pfp[0].filename;
                    if (req.files.background) user.background = background[0].filename;
                    // need to check email doesn't exist
                    // if (req.body.newEmail != req.body.email) user.email = req.body.newEmail;
                    console.log(`pfp: ${user.pfp} background: ${user.background}`);
                    console.log(`updated profile for user with email: ${user.email}`);
                    await user.save();

                    return res.status(201).send('Updated user pfp and background');
                } else {
                    return res.status(400).send('User does not Exist!');
                }
            } catch (error) {
                console.log(error);
                return next(error);
            }
        } else {
            console.log('no updates');
        }
    }
]

// get User public profile.
exports.get_user = async function (req, res, next) {


    try {
        const user = await User.findOne({ email: req.params.email }, '-_id') // exclude _id feild
            .lean()
            .exec();

        if (user) {
            profile = {
                pfp: user.pfp,
                background: user.background,
                verified: user.verified,

                bookmarks: user.bookmarks
            }
            return res.status(200).json(profile);

        } else {
            return res.status(400).send('User does not Exist!');
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

exports.reset_user = async function (req, res, next) {


    try {
        const user = await User.findOne({ email: req.body.email })
            .lean()
            .exec();

        if (user) {
            return res.status(200).json({
                question: 'What is your favourite subject'
            });

        } else {
            return res.status(400).send('User does not Exist!');
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

exports.request_password_reset = async function (req, res, next) {


    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            let token = await Token.findOne({ user_id: user._id });
            resetToken = crypto.randomBytes(16).toString('hex'); // base64 has / 
            const hashedToken = await bcrypt.hash(resetToken, 5);


            // had already made a reset password request within the last hour
            // just update the token and reset expire in one hour
            if (token) {
                // token.token = resetToken;
                // await token.save();
                await token.deleteOne();
            }

            await Token.create({
                token: hashedToken,
                user_id: user._id
            })

            // Format {token=resetToken, id=user._id}
            //const resetLink = `localhost:3000/user/password-reset/${resetToken}?id=${user._id}`;
            const resetLink = `http://140.238.206.232/user/password-reset/${resetToken}?id=${user._id}`;


            const to = req.body.email;
            const subject = "Reset Password";
            const text = `To reset your password follow this link: ${resetLink}`;
            const html = `Click <a href=${resetLink}>here</a> to reset yout Password`
            sendEmail(to, subject, text, html);

            return res.status(200).send('Email sent');

        } else {
            return res.status(400).send('User does not Exist!');
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

exports.password_reset = async function (req, res, next) {
    const { user_id, token, password } = req.body

    try {
        const resetToken = await Token.findOne({ user_id: user_id });
        // Exists token with matching user
        if (resetToken) {
            const isValidToken = await bcrypt.compare(token, resetToken.token);
            if (isValidToken) {
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = await User.findById(user_id);

                user.password = hashedPassword;
                await user.save();
                console.log(`user password has been reset to ${password}`);

                await resetToken.deleteOne();

                return res.status(200).send('Password Reset!');

            }
            return res.status(400).send('Token has expired');

        } else {
            return res.status(400).send('Token has expired');
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

exports.verify_user = async function (req, res, next) {
    const token = req.params.token;

    try {
        const validToken = await Token.findOne({ token: token });
        // Exists token with matching user
        if (validToken) {

            const user = await User.findById(validToken.user_id);

            if (user) {
                user.verified = true;
                await user.save();
                await validToken.deleteOne();
                console.log('User verified');
                return res.status(200).send('User Verified!');

            }
            return res.status(400).send('Token has expired');

        } else {
            return res.status(400).send('Token has expired');
        }
    } catch (error) {
        console.log(error);
        return next(error);
    }
}




