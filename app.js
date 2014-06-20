/**
 * Module dependencies.
 */

// set up ======================================================================
// get all the tools we need
var express    = require('express');
var app        = express();
var http 	   = require('http');
var path 	   = require('path');
var port       = process.env.PORT || 3000;
var mongoose   = require('mongoose');
var passport   = require('passport');
var flash 	   = require('connect-flash');
var MongoStore = require('connect-mongo-store')(express)

var configDB = require('./config/database.js');
var mongoStore = new MongoStore(configDB.url);

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

app.configure(function()
{
	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms
	app.use(express.static(path.join(__dirname, 'public'))); //static files
	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session(
	{
		store: mongoStore,
		secret: 'weareinlovewithavrillavigne',
		key: 'express.sid',
		httpOnly: false
	})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

// routes ======================================================================
require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
//app.listen(port);
server = http.createServer(app).listen(port, function()
{
  	console.log('Express server listening on port ' + port);
	console.log('Lets chat with Avril ' + port);
});

//socket io 
var users = {};
var tempUsername;

//var io = require('socket.io').listen(app);
var io = require('socket.io').listen(server);
var passportSocketIo = require("passport.socketio");

/*// set authorization for socket.io
io.configure(function ()
{
	io.set('authorization', passportSocketIo.authorize({
	  cookieParser: express.cookieParser,
	  key:         'express.sid',       // the name of the cookie where express/connect stores its session_id
	  secret:      'weareinlovewithavrillavigne',    // the session_secret to parse the cookie
	  store:       mongoStore,        // we NEED to use a sessionstore. no memorystore please
	  success:     onAuthorizeSuccess,  // *optional* callback on success 
	  fail:        onAuthorizeFail,     // *optional* callback on fail/error
	}));
});*/

io.set('authorization', function (handshakeData, cb) {
    tempUsername = handshakeData.query.username;
    cb(null, true);
});

io.sockets.on('connection', function (socket)
{
  	socket.username = tempUsername;
  	users[socket.username] = socket;
	updateUsers();

	socket.on('send message', function (data, callback)
	{
		var message = data.message.trim();
		if(message.substr(0,3) == '/w ')
		{
			message = message.substr(3);
			spaceIndex = message.indexOf(' ');
			if(spaceIndex !== -1)
			{
				var receiver = message.substr(0,spaceIndex);
				message = message.substr(spaceIndex + 1);
				if(receiver in users)
				{
					data.message = message;
					users[receiver].emit('whisper', data);
					users[data.user].emit('whisper', data);
				}
				else
				{
					callback('Enter a valid user');
				}
			}
			else
			{
				callback('Private message should be in this format: /w <username> <message>');
			}
		}
		else
			io.sockets.emit('new message', data);
	});

	socket.on('disconnect', function (data)
	{
		if(!socket.username) return;
		delete users[socket.username];
		updateUsers();
	});
});

function updateUsers()
{
	io.sockets.emit('usernames', Object.keys(users));
}