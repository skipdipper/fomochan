function isNestedPost(req, res, next) {
    console.log('nested post middleware ran');
    if (req.body.comment == null || hasPostId(req.body.comment) == null) {
        console.log('this post is not quoting another post');
        return next();
    }

    const matches = hasPostId(req.body.comment);
    console.log(`This post contains replies to posts with id: ${matches}`);

    // // remove >> from start of each item
    const quotePostIds = matches.map(id => id.slice(2));

    req.body.quotePostIds = quotePostIds;
    console.log(quotePostIds);

    return next();
}

function hasPostId(comment) {

    // starting with 2 '>'
    // followed by a number of with one or more digits
    // global match
    const regex = /[>]{2}[0-9]+/g;
    const found = comment.match(regex);

    // null if no matches else an array of matches
    return found;
}

module.exports = {
    isNestedPost: isNestedPost
};