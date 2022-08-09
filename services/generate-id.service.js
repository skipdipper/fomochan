const Counter = require('../models/counter');

//Atomically increment the seq value by 1 for a single counter document
async function nextSequence() {
    const filter = {}; //Empty filter to get arbitrary document since only single counter document 
    const update = { $inc: { seq_value: 1 } }; //Increase sequence value by 1
    const options = {
        new: true, //Same as returnNewDocument to true, atomically returns an incremented number
        upsert: true
    };

    const counter = await Counter.findOneAndUpdate(filter, update, options);

    return counter.seq_value;
}

module.exports = {
    nextSequence: nextSequence
};