// Sends a fallback image when request file is not found in uploads
// This middleware must be directly called behind express.static with 
// fallthrough set to false and called before catch-all error handler in app
function fileNotFoundErrorHandler(err, req, res, next) {
    var options = {
        // root: path.join(__dirname, 'public/images'),
        root: 'public/images',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    var fileName = '404-file-not-found.jpg';
    res.status(404).sendFile(fileName, options, function (err) {
        if (err) next(err);
        console.log('404 File Not Found');
    });
};

module.exports = {
    fileNotFoundErrorHandler
};