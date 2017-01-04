
codeTest = {
	config: {
		server: '127.0.0.1:8080'
	},
	nickName: 'person1',
	channel: 'defaultChannel',
	client: null,
	history: []	
};

jQuery(document).ready(init);


function init() {
	jQuery('#sendMsg').on(
		'click',
		function() {
			sendMsg(jQuery('#message').val());
		}
	);
	jQuery('#setNick').on(
		'click',
		setNick
	);
	jQuery('#joinChannel').on(
		'click',
		function() {
			joinChannel(jQuery('#joinChannel').val());
		}
	);
	jQuery('#connect').on(
		'click',
		function(e) {
			if (typeof codeTest.client !== null) {
				delete codeTest.client;
			}
			codeTest.config.server = jQuery('#serverUrl').val();
			codeTest.client = setupSocket();
		}
	);
	drawMessage({ author:'system', channel: codeTest.channel, text: 'welcome to the test', timestamp: new Date().toLocaleTimeString() });
};


function joinChannel(channel) {
	var channel = jQuery('#channel').val();
	jQuery('#messages').empty();
	codeTest.channel = channel;
	drawMessage({ author:'system', channel: codeTest.channel, text: 'welcome to a new channel (' + channel + '), ' + codeTest.nickName, timestamp: new Date().toLocaleTimeString() });
	return codeTest.client.send({ command: 'join', channel: codeTest.channel });
};


function setNick() {
	var nick = jQuery('#nickname').val();
	codeTest.nickName = nick;
	drawMessage({ author:'system', channel: codeTest.channel, text: 'greetings, ' + nick + '!', timestamp: new Date().toLocaleTimeString() });
	return codeTest.nickName;
};


function sendMsg(text) {
	var data = {
		author: codeTest.nickName,
		channel: codeTest.channel,
		text: text,
		timestamp: Date.now()
	};
	//the person who sends the message won't see it twice
	//drawMessage({ author:codeTest.nickName, channel: data.channel, text: data.text, timestamp: new Date().toLocaleTimeString() });
	return send2server('messages', data);
};


function send2server(command, data) {
	return codeTest.client.send(
		{
			command:command,
			data: [
				{
					author: codeTest.nickName,
					channel: codeTest.channel,
					text: data.text, 
					timestamp: data.timestamp
				}
			]
		}
	);
};


function handleMessageFromServer(msg) {
	if (typeof msg.type !== 'undefined' && typeof msg.data !== 'undefined') {
		// if (msg.command === 'messages') {
		// 	for (var n=0; n<msg.data; n+=1) {
		// 		drawMessage(msg.data[n]);
		// 	}
		// }
		if (msg.type === 'history') {
		    console.log("on join", msg.data.length);

		    for (var i = 0; i < msg.data.length; i++) {

		        var obj = JSON.parse(msg.data[i]);

		        if (obj.channel == codeTest.channel) {
		            drawMessage({
		                author: obj.author,
		                channel: obj.channel,
		                text: obj.text,
		                timestamp: convertTimestamp(obj.timestamp)
		            });
		        }
		    }
		    //before using redis I was storing the old messages in an array history
		    /*if (codeTest.history.length > 0) {

		        for (var i = 0; i < 10; i++) {
		            if (codeTest.history[i].channel == codeTest.channel) {
		                drawMessage({
		                    author: codeTest.history[i].author,
		                    channel: codeTest.history[i].channel,
		                    text: codeTest.history[i].text,
		                    timestamp: convertTimestamp(codeTest.history[i].timestamp)
		                });
		            }
		        }
		    }*/
		}
		if (msg.type === 'message') {

		   console.log('msg.data', msg.data);

		    console.log('JSON.parse(msg.data[i])', msg.data.author)
		    if (msg.data.channel == codeTest.channel) {
		        drawMessage({
		            author: msg.data.author,
		            channel: msg.data.channel,
		            text: msg.data.text,
		            timestamp: convertTimestamp(msg.data.timestamp)
		       });
		    }

		}
	}

};


function drawMessage(data) {
	var msgString = '<span>{' + data.channel + '@' + data.timestamp + '} [' + data.author + '] ' + data.text + '</span><br/>';
	jQuery('#messages').append(msgString);
};

function convertTimestamp(ts){
	var time;
	var date = new Date(ts);
	var hour = date.getHours();
	var meridiem = hour >= 12 ? "PM" : "AM";
    time = ((hour + 11) % 12 + 1) + ":" + date.getMinutes() + ":" + date.getSeconds() +" " + meridiem;
    return time;
}

function setupSocket() {
	try {
		var testSocket = new Socket(codeTest.config.server, { autoReconnect: true });
		testSocket.on('reconnect', function(msg, e) {
			console.log('reconnected');
		});
		testSocket.on('close', function(e) {
			console.log('[close]');
			jQuery('#wsstatus').text(Date.now() + ' connection closed');
		});
		testSocket.on('error', function(e) {
			console.log('[error]');
			jQuery('#wsstatus').text(Date.now() + ' connection error');
		});
		testSocket.on('open', function(e) {
			jQuery('#wsstatus').text(Date.now() + ' connection open');
			console.log('[open]');
			
		});
		//this was in callback of the testSocket.on ('open') but figured out that messages are sent twice
		testSocket.on('message', function(msg, e) {
		    console.log('[message]');
		    console.log(msg);
		    handleMessageFromServer(msg);
		});

		jQuery('#wsstatus').text(Date.now() + ' connecting to [' + codeTest.config.server + ']');
	} catch(err) {
		jQuery('#wsstatus').text(Date.now() + ' connection failed: ' + err);
	}
	return testSocket;
};

