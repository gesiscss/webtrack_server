/**
 *  CHANGE IN MYSQL-SERVER
 *  PATH: etc/mysql/mysql.conf.d/mysqld.cnf
 *  nano /etc/mysql/conf.d/mysql.cnf
 *  [...]
 *  max_allowed_packet=10G
 *  key_buffer_size         = 16M
 *  PARAM:
 *  max_allowed_packet      = 100000000
 *  net_buffer_length       = 1000000
 */

 //check if in the arguments the debug mode enable
global.debug = process.argv.join('#').includes('APPDEBUG=')? process.argv.filter(arg => arg.includes('APPDEBUG=')).map(arg => parseInt(arg.split('=')[1], 10)>0)[0] : false



var logtimestamp = require('log-timestamp');


var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var timeout = require('connect-timeout')


var validator = require('express-validator');
var cors = require('cors');
var helmet = require('helmet');

var index = require('./routes/index');
var tracking = require('./routes/tracking');
var users = require('./routes/users');
var api = require('./routes/api');
var project = require('./routes/project');
var filter = require('./routes/filter');
var settings = require('./routes/settings');
var client = require('./routes/client');

var ioError = require('./module/IOHandler').error;
var log = require('./module/lib/log');

var errorMailer = require('./module/lib/ErrorMailer');

var limiter = require('./module/Limiter').limiter;
var banner = require('./module/Limiter').banner;

var redisLoader = require('./module/ControlListsRedisLoader');

setTimeout(function () {
  var cron = require('./module/Cronjob');
  var downloadProject = require('./module/DownloadProject');
  downloadProject.onStart();
}, 1000);


var app = express();

app.use('/tracking/upload', banner);
app.use('/tracking/upload',limiter)
app.use(timeout('180s'))
app.use(log.request)

//for http security
app.use(helmet());
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'a', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb', extended: false}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit:50000 }));
app.use(cookieParser());

app.use(cors({origin: '*'}));
app.use(validator());

app.use('/', index);
app.use('/tracking', tracking);
app.use('/users', users);
app.use('/api', api);
app.use('/project', project);
app.use('/filter', filter);
app.use('/settings', settings);
app.use('/client', client);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  if(req.hasOwnProperty('headers') &&
     req.headers.hasOwnProperty('referer') &&
     typeof req.headers.referer === 'string' &&
     req.headers.referer.indexOf('/a/')<0){
    var err = new Error('Page not Found');
    err.status = 404;
    next(err);
  }else{
    res.status(400).end();
  }
});

// error handler
app.use(ioError);


process.on('unhandledRejection', async (type, promise, reason) => {
  try {
    if(typeof type == 'object'){
      console.error("type %s", type.stack);
      console.error("promise: %s", promise);
      console.error("reason: %s", reason);
      if(type.hasOwnProperty('stack')){
        error = type.stack.toString();
      }else{
        error = type
      }
    }else{
      error = type;
    }
    log.error(error);

  } catch (err) {
    console.error(err);
    log.error(err);
  }
});


//checks if the control list is loaded to redis, if not, it populates it from controllist.csv
redisLoader.loadCL2RedisIfEmpty();


module.exports = app;
