var fs = require('fs');
var path = require('path');


module.exports = class Config {

  constructor(){
    this.is = this.is.bind(this);
    this._create = this._create.bind(this);
    this._foundfile = false;
    this.CONFIG_PATH = 'db.json';
  }

  /**
   * [_path deliver full path of config-file]
   * @return {String}
   */
  get _path(){
    return path.resolve(__dirname, '..', '..', 'defined', this.CONFIG_PATH);
  }


  /**
   * [_isFile check if the config-file exist]
   * @return {Boolean}
   */
  _isFile(){
    try {
      if(this._foundfile==false) this._foundfile = fs.existsSync(this._path);
      return this._foundfile;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  /**
   * [_write write some object as JSON-string into the config-file]
   * @param  {Object} object
   * @return {Promise}
   */
  _write(object){
    return new Promise((resolve, reject)=>{
      if(!this._isFile())
        resolve('config.json not found');
      else
        fs.writeFile(this._path, JSON.stringify(object, null, 4), 'UTF-8', (err) => {
            if (err)
              reject(err)
            else
              resolve(true);
        });
    });
  }

  /**
   * [_create create the config-file]
   * @param {Object} object [default: {}]
   * @return {Promise}
   */
  _create(object={}){
    return new Promise((resolve, reject)=>{
      if(this._isFile()){
        resolve(true);
      }else{
        try {
          fs.writeFileSync(this._path, JSON.stringify(object, null, 4), 'UTF-8');
          resolve(true);
        } catch (err) {
          reject(err)
        }
      }
    });
  }

  /**
   * [_read read the config-file and parse the json-string]
   * @return {Promise} object
   */
  _read(){
    return new Promise((resolve, reject)=>{
      if(!this._isFile())
        resolve(null);
      else{
        fs.readFile(this._path, 'UTF-8', (err, json) => {
          try {
            if(err){
              reject(err);
            }else{
              resolve(JSON.parse(json));
            }
          } catch (e) {
            reject(e)
          }
        });
      }
    });
  }

  /**
   * [_update merge the object with the saved content of the config-file and save it]
   * @param  {Object} object
   * @return {Promise}
   */
  _update(object){
    return new Promise((resolve, reject)=>{
      this._read().then(config => {
        this._write(Object.assign(config, object)).then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  /**
   * [is check if file ist created and contains some values]
   * @return {Boolean}
   */
  is(){
    return new Promise(async (resolve, reject)=>{
      try {
        if(!this._isFile()){
          await this._create();
          resolve();
        }else{
          let config = await this._read();
          resolve(Object.values(config).length>0);
        }
      } catch (err) {
        reject(err)
      }
    });
  }


}//class
