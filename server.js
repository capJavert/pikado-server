var env2 = (process.env.NODE_ENV === 'production') ? require('env2')('projects/CyberdineServer/config/config-prod.json') : require('env2')('projects/CyberdineServer/config/config-dev.json');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var gcm = require('node-gcm');
var apnagent = require('apnagent');
var apns = require('./app/utils/pushUtils')(apnagent);
var port = process.env.PORT;

var socket = require('socket.io-client')('http://localhost');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

mongoose.connect(process.env.MONGO_URL);

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('view engine', 'ejs');

app.use(session({ secret: 'letsplayalittlegameofdarts' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var server = app.listen(port);
var io = require('socket.io')({ transports: [ 'websocket' ] }).listen(server);

// WEB ROUTES
require('./app/routes/application.js')(app, gcm, apns, passport);
require('./app/routes/authentication.js')(app, passport);
require('./app/routes/sockets.js')(io, app, gcm, apns, passport);
require('./app/routes/users.js')(app, passport);

// API v1.0 ROUTES
require('./app/routes/api_1_0/authentication_1.0.js')(app, passport);
require('./app/routes/api_1_0/emails_1.0.js')(app);
require('./app/routes/api_1_0/errors_1.0.js')(app);
require('./app/routes/api_1_0/game_1.0.js')(app);
require('./app/routes/api_1_0/locations_1.0.js')(app);
