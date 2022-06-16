const Board = require('../models/board');


// list of all Board.
exports.boards = function (req, res) {

    Board.find({}, '-_id')
        .lean()
        .exec(function (err, boards) {
            if (err) { return next(err); }
            //Successful, so send json
            res.status(200).json(boards);
        });

};

exports.board_directory = function (req, res) {

    Board.find()
        .select({ board: 1, _id: 0 })
        .lean()
        .exec(function (err, dirs) {
            if (err) { return next(err); }
            //Successful, so send json
            res.status(200).json(dirs);
        });

};

