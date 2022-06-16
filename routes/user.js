var express = require('express');
var router = express.Router();


const user_controller = require('../controllers/userController');

/* GET users listing. */
router.post('/signup', user_controller.create_user);
router.post('/login', user_controller.login_user);
router.get('/logout', user_controller.logout_user);
router.post('/update', user_controller.update_user);
router.get('/profile/:email', user_controller.get_user);
// router.post('/passreset', user_controller.reset_user);
router.post('/reset-password', user_controller.request_password_reset);
router.post('/reset-password-verify', user_controller.password_reset);
router.get('/verify/:token', user_controller.verify_user);

router.post('/bookmark', user_controller.add_bookmark);
router.get('/bookmark', user_controller.get_bookmark);
router.delete('/bookmark/:postid', user_controller.delete_bookmark);



module.exports = router;
