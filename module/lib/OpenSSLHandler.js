var openssl = require("openssl-wrapper").exec;
var path = require("path");
var fs = require('fs');

class OpenSSLHandler {

  constructor() {
    this.FOLDERPATH = './cert/';
    this.ssl = {
      key: path.resolve(this.FOLDERPATH+'sslkey.pem'),
      cert: path.resolve(this.FOLDERPATH+'sslcert.pem'),
    }
    this._sslkey = null;
    this._sslCert = null;

    this._default = {
      rsakey: {'2048': false},
    }
  }

  /**
   * [_loadCert load syncron content of file]
   * @param  {String} keypath
   * @return {String}
   */
  _loadCert(keypath){
    return fs.readFileSync(keypath, 'utf8')
  }

  /**
   * [_getNewRSAKey create new RSA-key]
   * @param  {Object} options [default: this._default.rsakey]
   * @return {Promise} String
   */
  _getNewRSAKey(options=this._default.rsakey){
    return new Promise((resolve, reject)=>{
      openssl('genrsa', options, (err, buffer) => {
        if(err)
          reject(err)
        else
          resolve(buffer.toString())
      });
    })
  }

  /**
   * [_getNewRSACert create new certificate of key]
   * @param  {String} keyPath [default: this.ssl.key]
   * @return {Promise} String
   */
  _getNewRSACert(keyPath=this.ssl.key){
    return new Promise((resolve, reject)=>{
      openssl('rsa', {pubout: true, in: keyPath}, (err, buffer) => {
        if(err)
          reject(err)
        else
          resolve(buffer.toString())
      });
    })
  }

  /**
   * [_isFile check sycron if file exist]
   * @param  {String}  path
   * @return {Boolean}
   */
  _isFile(path){
    try {
      return fs.lstatSync(path).isFile();
    } catch (e) {
      return false;
    }
  }

  /**
   * [_isRSAKey check if rsa-key exist]
   * @return {Boolean}
   */
  get _isRSAKey(){
    return this._isFile(this.ssl.key)
  }

  /**
   * [_isRSACert check if rsa-crt exist]]
   * @return {Boolean}
   */
  get _isRSACert(){
    return this._isFile(this.ssl.cert)
  }

  /**
   * [getKey load syncron and cache key or create and deliver it]
   * @return {Promise} String
   */
  getKey(){
    return new Promise((resolve, reject)=>{
      if(this._isRSAKey){
        if(this._sslkey==null) this._sslkey = this._loadCert(this.ssl.key);
        resolve(this._sslkey);
      }else{
        this._getNewRSAKey().then(key => {
          if(this._sslkey==null) this._sslkey = key;
          resolve(key);
        }).catch(reject)
      }
    })
  }

  /**
   * [getCert load syncron and cache key or create and deliver it]
   * @return {Promise} String
   */
  getCert(){
    return new Promise((resolve, reject)=>{
      if(this._isRSACert){
        if(this._sslCert==null) this._sslCert = this._loadCert(this.ssl.cert);
        resolve(this._sslCert);
      }else{
        this._getNewRSACert().then(cert => {
          if(this._sslCert==null) this._sslCert = cert;
          resolve(cert);
        }).catch(reject)
      }
    })
  }

  /**
   * [_createFile create File]
   * @param  {String} path
   * @param  {String} content
   * @return {Promise} Boolean
   */
  _createFile(path, content){
    return new Promise((resolve, reject)=>{
      fs.writeFile(path, content, 'UTF-8', (err) => {
          if (err)
            reject(err)
          else
            resolve(true);
      });
    });
  }

  /**
   * [init checks if rsa-key and certificate exist and create it if not exist]
   * @return {Promise}
   */
  init(){
    return new Promise((resolve, reject)=>{
      if(!this._isRSAKey){
        this.getKey().then(key => {
          this._createFile(this.ssl.key, key).then(()=> this.init().then(resolve).catch(reject) ).catch(reject);
        })
      }else if(!this._isRSACert && this._isRSAKey){
        this.getKey().then(() => {
          this._getNewRSACert().then(cert => {
            this._createFile(this.ssl.cert, cert).then(resolve).catch(reject);
          })
        })
      }else{
        resolve();
      }
    });

  }


}
module.exports = OpenSSLHandler;
