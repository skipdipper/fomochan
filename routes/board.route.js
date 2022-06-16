const express = require('express');
const router = express.Router();

const board_controller = require('../controllers/boardController');

/// Boards Routes ///
router.get('/', board_controller.boards);

router.get('/dir', board_controller.board_directory);
module.exports = router;
