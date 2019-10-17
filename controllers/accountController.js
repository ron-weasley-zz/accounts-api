const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Account = require('./../models/userModel');
const {
    messageRes,
    dataRes
} = require('../utils/response');

exports.readAccountInfo = async (req, res, next) => {
    var token;
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
        token = req.headers.cookie.split('=')[1];
    } else {
        return messageRes(200, 'success', 'Login first!', res);
    }

    const payload = await promisify(jwt.verify)(token, process.env.JWT_KEY);
    const userdata = await Account.findById(payload.data).select('-_id -__v');
    if (userdata === null) {
        return messageRes(404, '404 - Not Found', 'Account not found!', res);
    }

    dataRes(200, 'success', userdata, res);
};

exports.deleteAccount = async (req, res, next) => {
    var token;
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
        token = req.headers.cookie.split('=')[1];
    } else {
        return messageRes(200, 'success', 'Login first!', res);
    }

    const payload = await promisify(jwt.verify)(token, process.env.JWT_KEY);

    const account = await Account.findByIdAndDelete(payload.data);
    if (account === null) {
        return messageRes(404, '404 - Not Found', 'Account not found!', res);
    }

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + 500),
        httpOnly: true
    });
    messageRes(200, 'success', 'Account deleted permanently!', res);
};

exports.updateAccount = async (req, res, next) => {
    var token;
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
        token = req.headers.cookie.split('=')[1];
    } else {
        return messageRes(200, 'success', 'Login first!', res);
    }

    const properties = Object.getOwnPropertyNames(req.body);
    for (let i = 0; i < properties.length; i++) {
        if (!(properties[i] === 'name') && !(properties[i] === 'username') && !(properties[i] === 'password')) {
            messageRes(404, '404 - Not Found', `${properties[i]} do not exist!`, res);
            next();
        }
    };
    if ('password' in req.body) {
        req.body.password = await crypto.createHmac('sha512', process.env.PASSWORD_KEY).update(req.body.password).digest('hex');
    }
    const payload = await promisify(jwt.verify)(token, process.env.JWT_KEY);
    await Account.findOneAndUpdate({
        _id: payload.data
    }, req.body);
    const account = await Account.findById(payload.data).select('-_id -__v');
    if (account === null) {
        messageRes(404, '404 - Not Found', 'Account not found!', res);
    }

    messageRes(200, 'success', account, res);
};