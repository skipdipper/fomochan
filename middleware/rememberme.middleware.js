function rememberMe(req, res, next) {
    if (req.user) {
        console.log('User remember me persistant login redirect');
        return res.status(200).json({ message: 'already logged in via remember me', email: req.user.email });

    }
    console.log('not remember me!')

    return next();

}

module.exports = {
    rememberMe: rememberMe
};
