const jwt = require('jsonwebtoken');
const validator = require('validator');

const Account = require('./../models/userModel');
const {
    messageRes,
    dataRes
} = require('../utils/response');

const createtoken = data => {
    return jwt.sign({
        data
    }, process.env.JWT_KEY, {
        expiresIn: `${process.env.JWT_PERIOD_DAYS}d`
    });
};

const sendtoken = (userdata, req, res) => {
    const token = createtoken(userdata._id);

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * process.env.JWT_PERIOD_DAYS)),
        httpOnly: true
    });

    userdata.password = '-protected-';
    userdata.passwordConfirm = undefined;

    res.status(200).json({
        status: 'success',
        token,
        data: userdata
    });
};

exports.signup = async (req, res, next) => {
    if (!validator.isEmail(req.body.email)) {
        return messageRes(400, 'fail', `Invalid Email!`, res);
    } else if (req.body.username.includes('@')) {
        return messageRes(400, 'fail', `Invalid Username!`, res);
    } else if (!(req.body.password === req.body.passwordConfirm)) {
        return messageRes(400, 'fail', `Password didn't match!`, res);
    }
    const newAccount = await Account.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    sendtoken(newAccount, req, res);
};

exports.login = async (req, res, next) => {
    let userdata = null;
    if (!req.body["username/email"] || !req.body.password) {
        return messageRes(404, '404 - Not Found!', "Enter the valid details.", res);
    }
    if (validator.isEmail(req.body["username/email"])) {
        userdata = await Account.findOne({
            email: req.body["username/email"]
        }).select('+password -__v');
    } else {
        userdata = await Account.findOne({
            username: req.body["username/email"]
        }).select('+password -__v');
    }

    if (userdata !== null && userdata.verifyPassword(req.body.password, userdata.password)) {
        sendtoken(userdata, req, res);
    } else {
        messageRes(404, '404 - Not Found!', "Enter the valid details.", res);
    }
};

// exports.verify = 