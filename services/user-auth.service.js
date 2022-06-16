const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const User = require('../models/user');


const authenticateUser = async function (email, password) {
    try {
        const user = await User.findOne({ email }).lean()
        if (!user) {
            return { code: 401, message: 'user not found' }
        }
        if (await bcrypt.compare(password, user.password)) {

            return { code: 200, message: 'user authenticated', user: user }

        }
        return { code: 401, message: 'incorrect password', user: null }
    } catch (error) {
        console.log(error);
        return { code: 500, message: 'server timed out', user: null }
    }

}

function generateAccessToken(user, expiresIn = '5s') {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: expiresIn })
}

function generateRefreshToken(user, expiresIn = '14d') {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: expiresIn })
}

module.exports = {
    authenticateUser: authenticateUser,
    generateAccessToken: generateAccessToken,
    generateRefreshToken: generateRefreshToken
};