const exec = require('child_process').fork;
const path = require('path');
const log = require('./log');
const MAXCOUNT = 3;
const PROCESS_LIMIT = 20;



class SubProcess {

  constructor(){
    this.getRequest = this.getRequest.bind(this);
    this.FOLDERPATH = 'subprocess'
    this.tmpobj = null;
  }

  /**
   * [exec subprocess from specific process file on the project folder "subprocess"]
   * @param  {String} file     ["createDownloadFile", "saveUpload"]
   * @param  {Object} [arg={}] [Parameter to send on the SubProcess]
   * @param  {Integer} [memory=512] [Parameter to send on the SubProcess]
   * @return {Promise}
   */
  exec(file, arg={}, memory=512){
    return new Promise(async (resolve, reject)=>{
      try {
        if(this.isProgress) throw new Error('SubProcess is running');
        const node = exec(path.resolve(this.FOLDERPATH, file+'.js'), { cwd: process.cwd(), detached:true, execArgv: ['--stack-size=50000', '--max-old-space-size='+memory]});

        node.send(arg);
        node.on('message', res => this.getRequest(res, async (logMSG, response) => {
          if(logMSG!=null){
            log.msg(...['Subprocess', file].concat(logMSG));
          }else if (response!=null) {
            if(response.hasOwnProperty('error') && response.error != null){
              reject(response.error)
            }else if(response.hasOwnProperty('result') && response.result != null){
              resolve(response.result)
            }
          }
        }))
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * [createDownloadFile // start the subprocess with the file subprocess/createDownloadFile.js]
   * @param  {Object} [arg={}]
   * @return {Promise}
   */
  createDownloadFile(arg={}){
    return this.exec('createDownloadFile', arg, 12288);
  }

  /**
   * [saveUpload // start the subprocess with the file subprocess/saveUpload.js]
   * @param  {Object} [arg={}]
   * @return {Promise}
   */
  saveUpload(arg={}){
    return new Promise(async (resolve, reject) => {
        let count = 0;
        let error = null
        do {
          try {
            count += 1;
            await this.exec('saveUpload', arg, 6144);
            break;
          } catch (err) {
            error = err;
          }
        } while (count<MAXCOUNT);
        if(count==MAXCOUNT){
          console.error(error);
          reject(error)
        }else{
          resolve();
        }
    });
  }

  /**
   * [response send response msg to the parent process]
   * @param  {Object} object [default: {}]
   */
  response(object={}){
    process.send(Object.assign({error: null, result: null}, object));
  }

  /**
   * [log send log msg to the parent process]
   * @return {[type]} [description]
   */
  log(){
    process.send({log: Object.values(arguments)});
  }

  /**
   * [getRequest handler to response log and msg from subprocess]
   * @param  {Object} res
   * @param  {Function} cb [Default: (log, response)=>{}]
   */
  getRequest(res={}, cb=(log, response)=>{}){
    if(res.hasOwnProperty('log')){
      cb(res.log, null)
    }else if(res.hasOwnProperty('error') && res.hasOwnProperty('result')){
      cb(null, res)
    }else{
      cb(res, null)
    }
  }

  close(error=false){
    setTimeout(()=> process.exit(error? 1: 0), 1000);
  }



}//class



module.exports = SubProcess;
