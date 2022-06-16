const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CounterSchema = new Schema(
    {
        seq_value: { type: Number },
        // __v: { type: Number, select: false }
    },
);


module.exports = mongoose.model('Counter', CounterSchema);