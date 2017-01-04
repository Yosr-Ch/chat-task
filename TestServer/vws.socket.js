var http            = require('http'),
    util            = require('util'),
    WebSocketServer = require('websocket').server;

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("../TestClient/");

/**
 *  [Server description]
 *  @param {[type]}   id   [description]
 *  @param {Function} next [description]
 */
var Server = function( id, next ) {

  this.id           = id;
  this.next         = next;
  this.connections  = {};

  return this;
};


/**
 *  [config description]
 *  @param  {[type]} customConfig [description]
 *  @return {[type]}              [description]
 */
Server.prototype.config = function ( customConfig ) {

  this.config = customConfig;

  init.call(this);
};


/**
 *  [send description]
 *  @param  {[type]} ids [description]
 *  @param  {[type]} msg [description]
 *  @return {[type]}     [description]
 */
Server.prototype.send = function ( msg, ids ) {

  if ( ids && !Array.isArray(ids) ) ids = [ ids ];

  var connections = this.connections,
      keys        = ids || Object.keys( connections );

  for ( var i = 0, l = keys.lengths; i < l; i++ ) {
    connections[ keys[i] ].send( JSON.stringify( msg ) );
  }
};


/**
 *  [init description]
 *  @return {[type]} [description]
 */
function init(){

  if ( !(this.config.port1 ) ) throw new Error('Requires a port to listen !');

  var server1, server2, socketServer1, socketServer2;
//When I read in the spec that I have to run two instances on different ports I created two servers with different ports
//even if I knew I can open many tabs connecting to the same port
//it took me three iterations to make it work
  server1 = http.createServer( function ( req, res ) { 
    console.log('[request1]'); 
    
    var done = finalhandler(req, res);
    serve(req, res, done);
  });

  /*server2 = http.createServer( function ( req, res ) { 
    console.log('[request2]'); 
    
    var done = finalhandler(req, res);
    serve(req, res, done);
  });*/


  socketServer1 = new WebSocketServer({ httpServer: server1, autoAcceptConnections : false });
  //socketServer2 = new WebSocketServer({ httpServer: server2, autoAcceptConnections : false });

    server1.listen( this.config.port1, function(){

    console.log( new Date() + ' - Server1 is listening on port: ', this.config.port1 );

    socketServer1.on('request', function ( req ) {

      var connections = this.connections,

          conn        = req.accept( this.config.protocol || null, req.origin ),

          id          = createUID(),

          next        = this.next;

      connections[ id ] = conn;

      conn.send( conn.id = id );

      conn.on('close', function() { delete connections[ this.id ]; });

      next( conn, this );

      conn.emit( 'open', id );

    }.bind(this));

  }.bind(this));

  /*server2.listen( this.config.port2, function(){

    console.log( new Date() + ' - Server2 is listening on port: ', this.config.port2 );

    socketServer2.on('request', function ( req ) {

      var connections = this.connections,

          conn        = req.accept( this.config.protocol || null, req.origin ),

          id          = createUID(),

          next        = this.next;

      connections[ id ] = conn;

      conn.send( conn.id = id );

      conn.on('close', function() { delete connections[ this.id ]; });

      next( conn, this );

      conn.emit( 'open', id );

    }.bind(this));

  }.bind(this));*/
}




/**
 *  [createUID description]
 *
 *  Based on @broofa:
 *  http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
 *  @return {[type]} [description]
 */
function createUID() {

  var random, value;

      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function ( c ) {

            random = Math.random()*16|0;

            value = ( c === 'x' ) ? random : (random&0x3|0x8);

            return value.toString(16);
          });

  return id;
}


/**
 *  [createServer description]
 *  @param  {[type]} id              [description]
 *  @param  {[type]} requestListener [description]
 *  @return {[type]}                 [description]
 */
var createServer = function ( id, requestListener ) {

  return new Server( id, requestListener );
};


module.exports = { server: createServer };