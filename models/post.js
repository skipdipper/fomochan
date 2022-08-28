const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        post_id: { type: Number },
        thread_id: { type: Number, required: true },
        name: { type: String },
        comment: { type: String, maxLength: 1000 },
        created_at: { type: Number, default: Math.floor(Date.now() / 1000), required: true },
        poster: { type: String },
        capcode: { type: String },
        tripcode: { type: String },

        // make into shared file subdocument
        filename: { type: String },
        ext: { type: String, enum: ['.png', '.jpg', '.webm'] },
        width: { type: Number },
        height: { type: Number },
        thumbnail_w: { type: Number },
        thumbnail_h: { type: Number },
        filesize: { type: Number },
        tim: { type: Number },
        file_deleted: { type: Boolean },

        replies: [{ type: Number }],

        // default: undefined prevent initialize empty array
        // repliess: { type: [Number], default: undefined },


        __v: { type: Number, select: false }
    },
);

function hasAttachment(value) {
    return value.filename != null;
}

// Remove name field that is empty string or null
PostSchema.pre('save', function (next) {
    if (this.name === '' || this.name === null) {
        this.name = undefined;
    }
    next();
});


// module.exports = mongoose.model('Post', PostSchema);
const Post = mongoose.model('Post', PostSchema);
const GPost = mongoose.model('GPost', PostSchema);
const VPost = mongoose.model('VPost', PostSchema);

const postCollections = {
    "/a": Post,
    "/g": GPost,
    "/v": VPost
};

// Helper function to get the Post Collection for a specific board
function getPostCollection(board) {
    if (!(postCollections.hasOwnProperty(board))) {
        throw new Error(`Unknown Collection for board ${board}`);
    }

    return postCollections[board];
}


module.exports = {
    getPostCollection
}