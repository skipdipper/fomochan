function authUser(req, res, next) {
    if (req.user == null) {
        return res.status(401).json({ message: 'Unauthorised User Acceess. You need to be signed in' });
    }
    console.log(`Accessing resource by authorised user: ${req.user}`)
    return next();
}

function authAdmin(req, res, next) {
    if (req.user.email == 'user1@gmail.com') {
        return next();
    }

    return res.status(403).json({ message: 'Unauthorised User Acceess. You need to be admin' });

}

module.exports = {
    authUser: authUser,
    authAdmin: authAdmin
};

