var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const boardRouter = require('./routes/board.route')
const catalogRouter = require('./routes/catalog');

const { fileNotFoundErrorHandler } = require('./middleware/file-fallback.middleware');
const { authenticateToken } = require('./middleware/jwt-auth.middleware');


var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// express behind NGINX proxy
// X-Forward-For to identify originating IP address of client instead of internal
// IP address of reverse proxy
app.set('trust proxy', 'loopback') // specify a single subnet

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// check access and refresj jwt token middleware
app.use(authenticateToken);

// Temporary Static Image Host directory for user-generated content
app.use('/img', express.static(path.join(__dirname, 'uploads'), { fallthrough: false }));
// Temporary error handler for express.static when File Not Found 
app.use(fileNotFoundErrorHandler);


// CORS Policy
app.use(cors());

// Cache Strategy
app.use(function (req, res, next) {
  if (req.method === 'GET') {
    // sends http 304 not modified
    // res.set('Cache-control', 'no-cache');
    // res.set('Cache-control', 'no-store');
    res.set('Cache-control', 'public');
  } else {
    res.set('Cache-control', 'no-store');
  }
  next();
});

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/boards', boardRouter);
// app.use(['/a', '/b', '/c', '/jp', '/vt'], catalogRouter);  // Add catalog routes to middleware chain.
app.use(['/a', '/g', '/v'], catalogRouter);

// Client connection test
app.get("/client", (req, res) => {
  const { ip, hostname, protocol, secure, xhr } = req;
  return res.json({ ip, hostname, protocol, secure, xhr });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // console.log(err)
  // res.render('error');

  // send as json instead of rendering html
  res.status(err.status || 500).json({ error: err });
});

module.exports = app;
