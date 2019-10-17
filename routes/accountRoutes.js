const express = require('express');
const authController = require('./../controllers/authController');
const accountController = require('./../controllers/accountController');

const router = express.Router();

router
    .route('/')
    .get(accountController.readAccountInfo)
    .delete(accountController.deleteAccount)
    .patch(accountController.updateAccount);

router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);


module.exports = router;