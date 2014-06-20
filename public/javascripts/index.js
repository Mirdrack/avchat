$(document).ready(function()
{
	var socket 	= io.connect('http://localhost:3000');
	var window  = $(window);
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
		var theUser = getUsername();
		socket.emit('new user', theUser, function(data)
		{
			if(!data)
				console.log('Error adding username to chat');
		});
		socket.username = theUser;
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
		console.log(data);
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

function randomString(len, charSet)
{
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function getUsername()
{
	$("#username").html();
}

/*
function getCookie(cname)
{
	var name = cname + "=";
 	var ca = document.cookie.split(';');
 	for(var i=0; i<ca.length; i++) 
   	{
   		var c = ca[i].trim();
   		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  	}	
 	return "";
}*/