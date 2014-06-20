$(document).ready(function()
{
	var socket 	= io.connect('http://'+window.location.hostname+':3000', { query: "username=" + getUsername() });
	console.log('host: ' + window.location.hostname);
	var message = $('#message');
	var sendBtn = $('#sendBtn');

	message.keydown(function(event)
	{
	    if(event.which == 13)
	    {
	    	socket.emit('send message',{user: socket.username, message: message.val()}, function (data)
	    	{
	    		printMessage({user: 'Error', message: data}, false);
	    	});
			message.val('');
	    }
	});

	sendBtn.click(function(e)
	{
		e.preventDefault();
		socket.emit('send message', {user: socket.username, message: message.val()}, function( data)
		{
			printMessage({user: 'Error', message: data}, false);
		});
		message.val('');
	});

	socket.on('connect', function()
	{
		/*var theUser = getUsername();
		socket.emit('new user', theUser, function(data)
		{
			if(!data)
				console.log('Error adding username to chat');
		});*/
		socket.username = getUsername();
	});

	socket.on('usernames', function (data)
	{
		printUserlist(data);
	});

	socket.on('new message', function (data)
	{
		printMessage(data, false);
	});

	socket.on('whisper', function (data)
	{
		printMessage(data, true);
	});
});

function printMessage(data, isWhisper)
{
	if(isWhisper)
		output =  '<span class="whisper">';
	else
		output =  '<span class="normal">';
	output += '<strong>' + data.user + ': </strong>';
	output += data.message + '</span>';
	output += '<br>';
	$("#chatMessageBox").append(output);
}

function printUserlist(data)
{
	output = '<strong>Users list</strong><br>';
	for(cont = 0; cont < data.length; cont++)
	{
		userSpan  = '';
		userSpan += '<span>';
		userSpan += data[cont];
		userSpan += '</span>';
		userSpan += '<br>';
		output += userSpan;
	}
	$('#usersList').html(output);
}

function getUsername()
{
	return $("#username").html();
}
