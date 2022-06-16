var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BoardSchema = new Schema(
    {
        board: { type: String, required: true },
        title: { type: String, required: true },
        meta_description: { type: String, required: true },
        thread_per_page: { type: Number, default: 15, required: true },
        pages: { type: Number, default: 10, required: true },
        bump_limit: { type: Number, default: 300, required: true },
        reply_limit: { type: Number, default: 500, required: true },
        image_limit: { type: Number, default: 100, required: true },
        max_comment_chars: { type: Number, default: 2000, required: true },
        max_filesize: { type: Number, default: 4194304, required: true },
        max_webm_filesize: { type: Number, default: 3145728, required: true },
        max_webm_duration: { type: Number, default: 120, required: true },
        archived: { type: Boolean },
        spoilers: { type: Boolean },
    }
);

module.exports = mongoose.model('Board', BoardSchema);
