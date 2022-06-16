const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TokenSchema = new Schema(
    {
        token: { type: String, required: true },
        expire_at: { type: Date, expires: 3600, default: Date.now },
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }

)

// module.exports = mongoose.model('Token', TokenSchema);
const userDB = mongoose.connection.useDb('userDB');
module.exports = userDB.model('Token', TokenSchema);
