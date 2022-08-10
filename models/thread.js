const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ThreadSchema = new Schema(
    {
        subject: { type: String, maxLength: 100 },
        sticky: { type: Boolean },

        post_id: { type: Number, required: true },
        thread_id: { type: Number, default: 0, required: true },
        name: { type: String },
        comment: { type: String, maxLength: 1000 },
        // created_on: { type: Date, default: Date.now, required: true },
        created_at: Number,
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


        replies: { type: Number, default: 0, required: true },
        images: { type: Number, default: 0, required: true },
        bumplimit: { type: Boolean },
        imagelimit: { type: Boolean },
        archived: { type: Boolean },
        archived_on: { type: Date },
        tag: { type: String },
        slug: { type: String },
        // last_modified: { type: Date, default: Date.now, required: true },
        last_modified: Number,
        // last_replies: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
        last_replies: [{ type: Number }],


        __v: { type: Number, select: false }
    },
    {
        timestamps: {
            currentTime: () => Math.floor(Date.now() / 1000), // Unix time, stored as Number not Date
            createdAt: 'created_at',
            updatedAt: 'last_modified'
        }
    }
);

ThreadSchema.pre('remove', function (next) {
    this.model('Post').deleteMany({ thread_id: this.thread_id }, next);
});

// Remove name field that is empty string or null
ThreadSchema.pre('save', function (next) {
    if (this.name === '' || this.name === null) {
        this.name = undefined;
    }
    next();
});


module.exports = mongoose.model('Thread', ThreadSchema);
