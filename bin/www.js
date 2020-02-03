var debug = require('debug')('myapp:server');
var http = require('http');
var https = require('https');
var certHandler = require('../module/lib/CertificatHandler');

var log = require('../module/lib/log');
var OpenSSLHandler = require('../module/lib/OpenSSLHandler');
var clientCertHandler = new OpenSSLHandler();
clientCertHandler.init().then(() => {

    var app = require('../app');

    var credentials = {
      key: certHandler.getKey(),
      cert: certHandler.getCert(true)
    }

    /**
     * Get port from environment and store in Express.
     */
    var port = normalizePort(process.env.PORT || '9080');
    var certPort = normalizePort(process.env.SSLPORT || '9443');
    app.set('port', port);

     /**
      * Create HTTP server. & Listen on provided port, on all network interfaces.
      */
    var certServer = https.createServer(credentials, app).listen(certPort);
    certServer.on('error', onError);
    certServer.on('listening', () => onListening(certServer));
    //certServer.timeout = 180000;
    //console.log(certServer.timeout);

    var server = http.createServer((req, res) => {
        if(req.headers.hasOwnProperty('host')) res.writeHead(301, { "Location": "https://" + (req.headers['host'].includes(':')? req.headers['host'].split(':')[0]: req.headers['host']) + ':' +  certPort + req.url });
        res.end();
    }).listen(port);
    server.on('error', onError);
    server.on('listening', () => onListening(server));


})//init clientCertHandler




/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      log.error(bind + ' requires elevated privileges')
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      log.error(bind + ' is already in use')
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(server) {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  log.msg('Listening on ' + bind);
}
