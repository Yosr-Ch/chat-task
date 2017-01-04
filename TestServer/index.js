'use strict'

var config        = require('./config.js'),
    socketServer  = require('./vws.socket.js').server,
    redis = require('redis');

//create two clients for redis one for publishing the messages the other for receiving them when joining the channel
var pub = redis.createClient();
var sub = redis.createClient();

var clients = [];
var i = 0;

socketServer( 'example', function ( connection, server ) {

  connection.on('open', function ( id ) {
    console.log('[open]');
    clients.push(connection);

  });

  connection.on('message', function ( msg ) {
    console.log('[message]');
    console.log(msg);

    //I thought that redis pub/sub could do the work for me, apparently I didn't know how to use the subscribe and publish functions
    /*sub.on("subscribe", function(channel) {
      console.log("Subscribed to " + channel);
    });

    sub.on('message', function(channel, text) {
      // Broadcast the message to all connected clients on this server.
      console.log('mssssssssss ' + text + ' from channel' + channel)
    });*/

  if (msg.type === 'utf8') {
    var json = JSON.parse(msg.utf8Data);
    //join channel to get messages
    if (json.action.command == 'join') {
        //when I thought that redis pub/sub could do the work for me
        //sub.subscribe(json.action.channel);

        //get history from redis

        //at first I worked with zrange withscores
        // var res = pub.zrange('history', -10, -1 , 'withscores', function(err, members) {
        //   var tab = [];
        //   for(var i=0; i<members.length; i+=2){
        //     tab.push(members[i]);
        //   }
        //   connection.send(JSON.stringify({ type: 'history', data: tab} ));
        // });
        var res = pub.zrange('history', -10, -1 , function(err, members) {
          var tab = [];
          for(var i=0; i<members.length; i++){
            tab.push(members[i]);
          }
          connection.send(JSON.stringify({ type: 'history', data: tab} ));
        }); 
    } else if (json.action.command == 'messages') {

        pub.zadd('history', json.action.data[0].timestamp, JSON.stringify(json.action.data[0])); 

        
        //var rep = pub.publish('defaultChannel', 'message to all');
        //console.log('reply', rep)
        
        //broadcast message to all connected clients
        for (var i=0; i < clients.length; i++) {
            clients[i].send(JSON.stringify({ type:'message', data: json.action.data[0] }));
        }
    }
  }
connection.send(msg.utf8Data);
});

  connection.on('error', function ( err ) {
    console.log(err);
  });

  connection.on('close', function(){
    console.log('[close]');
    //all messages expire after 24 hours
    pub.expire('history', 24*60*60);
    
    clients.splice(clients.indexOf(connection), 1);
  });


}).config( config );

console.log("Chat test server app ready");
