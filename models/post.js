const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        post_id: { type: Number },
        thread_id: { type: Number, required: true },
        name: { type: String, default: 'anonymous' },
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

module.exports = mongoose.model('Post', PostSchema);
