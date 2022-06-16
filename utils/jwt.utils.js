const jwt = require('jsonwebtoken');
require('dotenv').config()

function signJwt(payload, secret, expiresIn) {
    return jwt.sign({ ...payload }, secret, { expiresIn: expiresIn });

}

function generateAccessToken(user, expiresIn = '5s') {
    return jwt.sign({ id: user._id, username: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: expiresIn })
}

function generateRefreshToken(user, expiresIn = '14d') {
    return jwt.sign({ id: user._id, username: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: expiresIn })
}

module.exports = {
    signJwt: signJwt
};