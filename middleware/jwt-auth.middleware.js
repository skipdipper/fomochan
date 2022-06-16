const jwt = require('jsonwebtoken');
// use jose package instead for zero dependencies

function verifyJwt(token, secret) {
    try {
        const decoded = jwt.verify(token, secret);
        return { payload: decoded, expired: false };
    } catch (error) {
        return { payload: null, expired: true };
    }
}

function authenticateToken(req, res, next) {
    console.log('auth middleware ran');

    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
        console.log('access JWT cookie and refresh JWT cookie not set');
        return next();
    }
    console.log('access token cookie set');

    const { payload, expired } = verifyJwt(accessToken, process.env.JWT_ACCESS_SECRET);
    // check valid access token
    if (payload) {
        console.log('access token is still valid');
        req.user = payload;
        return next();
    }

    console.log('access token has expired');

    // access token expired but refresh token still valid
    const { payload: refresh } = expired && refreshToken ? verifyJwt(refreshToken, process.env.JWT_REFRESH_SECRET) : { payload: null }
    if (!refresh) {
        return next();
    }

    // generate new access token
    const newAccessToken = jwt.sign(
        { id: refresh.id, email: refresh.email },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15min' }) // change to 15min

    // Reset access Token cookie
    res.cookie('accessToken', newAccessToken, {
        maxAge: 5 * 60 * 1000, // 5 minutes in milliseconds
        httpOnly: true
    });

    req.user = refresh;

    return next();
}


module.exports = {
    authenticateToken: authenticateToken
};

