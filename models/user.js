const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        email: {
            type: String, unique: true, required: true,
            match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        },
        password: { type: String, required: true },
        pfp: String,
        background: String,
        verified: { type: Boolean, default: false },
        bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Thread' }],

    }
);

const userDB = mongoose.connection.useDb('userDB');

// module.exports = mongoose.model('User', UserSchema);
module.exports = userDB.model('User', UserSchema);
