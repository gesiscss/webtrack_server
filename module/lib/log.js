const log2File = require('log-to-file');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

class Log {

  constructor() {
    this.request = this.request.bind(this);
    this.error = this.error.bind(this);
    this.msg = this.msg.bind(this);
    this.FOLDER = path.resolve('storage', 'logs');
    this.REQUEST = 'request.log';
    this.ERROR = 'error.log';
    this.MSG = 'msg.log';
  }

  writeLog(str, file){

    // create a new file if the old log file bigger than 500MB are
    if(fs.existsSync(file) && fs.statSync(file).size > 500000000){ 
      let splitName = file.split('.');
      let extension = splitName.pop();
      splitName.push(moment().format('DD-MM-YY_HH:mm:ss'), extension)
      fs.renameSync(file, splitName.join('.'))
    }
    log2File(str, file);
  }

  errorLog(str=''){
    this.writeLog(str, path.resolve(this.FOLDER, this.ERROR));
  }

  requestLog(str=''){
    this.writeLog(str, path.resolve(this.FOLDER, this.REQUEST));
  }

  msg(){
    let str = [];
    console.log(...arguments)
    for (let arg of arguments) {
      str.push(typeof arg == 'object'? JSON.stringify(arg) : arg.toString());
    }
    str = str.join(' ');
    log2File(str, path.resolve(this.FOLDER, this.MSG));
  }

  _getHashCode(str=''){
    try {
      var hash = 4243, i = str.length;
      while(i)
        hash = (hash * 31) ^ str.charCodeAt(--i);
      return hash >>> 0;
    } catch (err){
      return str;
    }
  }

  request(req, res, next){
    // console.log(req);
    try {
      this.requestLog([req.headers['x-forwarded-for'] || this._getHashCode(req.connection.remoteAddress), '"'+req.method, req.originalUrl+'"', '"'+req.headers['user-agent']+'"'].join(' '));
    } catch (err) {
      Promise.reject(err)
    } finally {
      next();
    }
  }

  _checkErrorMsg(error){
    let msgs = ['jwt', 'expired', 'Page not Found', 'No User found', 'No User found', 'Username or Password is invalid', 'Configuration-File was not filled', 'Response timeout'];
    for (let msg of msgs) {
      if(error.indexOf(msg)>=0) return false
    }
    return true
  }

  error(err){
    let msg = '';
    if(typeof err == 'object' && err.hasOwnProperty('stack')){
      msg = err.stack;
    }else if(typeof err === 'string'){
      msg = err;
    }
    this.errorLog(msg);

  }

}//class

module.exports = new Log()
