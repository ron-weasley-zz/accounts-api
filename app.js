const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');

const accountRouter = require('./routes/accountRoutes')

const app = express();

app.enable('trust proxy');

app.use(cors());
app.options('*', cors());

app.use(helmet());

app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// const limiter = rateLimit({
//     max: 100,
//     windowMs: 10 * 60 * 1000,
//     message: 'Requests from this IP are blocked. Try again after some time!'
// });
// app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

app.use('/api/v1/accounts', accountRouter);

app.all('*', (req, res, next) => {
    res.status(404).json({
        title: 'Accounts API - 404',
        message: 'NOT FOUND!'
    });
});

module.exports = app;