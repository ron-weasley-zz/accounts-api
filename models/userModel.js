const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');

const useraccountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'What\'s your name?']
    },
    username: {
        type: String,
        required: [true, 'Enter a unique username!'],
        unique: true,
        validate: {
            validator: function (el) {
                return !el.includes('@');
            },
            message: '\'@\' not allowed in username.'
        }
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email required!'],
        validate: [validator.isEmail, 'Email! A valid Email.']
    },
    password: {
        type: String,
        minlength: process.env.PASSWORD_MIN_LENGTH,
        required: [true, 'Security is must.'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Copy & paste the password.'],
        select: false,
        validate: {
            validator: function (el) {
                return el === this.password; // Comparing it to password
            },
            message: 'Password = Confirm Password.'
        }
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordChangedAt: {
        type: Date,
        select: false
    },
    passwordResetValidity: {
        type: Date,
        select: false
    }
});

useraccountSchema.pre('save', async function (next) {
    this.password = await crypto.createHmac('sha512', process.env.PASSWORD_KEY).update(this.password).digest('hex');
    this.passwordConfirm = null;
    next();
});

useraccountSchema.methods.verifyPassword = function (passwordEntered, password) {
    passwordEntered = crypto.createHmac('sha512', process.env.PASSWORD_KEY).update(passwordEntered).digest('hex');
    return password === passwordEntered;
};

const User = mongoose.model('User', useraccountSchema, 'Accounts');

module.exports = User;