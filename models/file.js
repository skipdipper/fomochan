var mongoose = require('mongoose');

var Schema = mongoose.Schema;


// Subdocument
var FileSchema = new Schema(
    {
        filename: { type: String, required: true },
        ext: { type: String, enum: ['png', 'jpg', 'webm'], required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        thumbnail_w: { type: Number, required: true },
        thumbnail_h: { type: Number, required: true },
        filesize: { type: Number, required: true },
        tim: { type: Number, required: true },

        file_deleted: { type: Boolean },


    }
);


module.exports = mongoose.model('File', FileSchema);