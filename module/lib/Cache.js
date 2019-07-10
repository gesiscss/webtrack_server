const NodeCache = require( "node-cache" );
var crypto = require('crypto');

class Cache {

  constructor(settings = { stdTTL: 60*60 }){
    this.settings = settings
    this._instance = this.getInstant();
  }

  /**
   * [getHash return hast-code from string]
   * @param  {String} str
   * @return {String}
   */
  getHash(str){
    return crypto.createHash('md5').update(str).digest("hex");
  }

  /**
   * [getInstant return instance of NodeCache]
   * @param  {Object} [settings] [default { stdTTL: 60*60 }]
   * @return {Object}  nodeCache
   */
  getInstant(settings=this.settings){
    return new NodeCache(settings);
  }


  /**
   * [delete override the instance]
   */
  delete(){
    this._instance = this.getInstant();
  }

  /**
   * [_get return the cache value of cache name]
   * @param  {String} name
   * @return {Unknown}
   */
  _get(name){
    return new Promise((resolve, reject)=>{
      this._instance.get(this.getHash(name), ( error, cache ) => {
        if(error)
          reject(error);
        else
          resolve(cache);
      })
    });
  }

  /**
   * [_set set the cache value of some name]
   * @param {String} name
   * @param {Unknown} cache
   */
  _set(name, cache){
    return new Promise((resolve, reject)=>{
      this._instance.set(this.getHash(name), cache, ( error, success ) => {
        if(error)
          reject(error)
        else if( success )
          resolve(cache)
      })
    });
  }

  /**
   * [action run the cachePromise if the value of name is not defined and save the value to the cache]
   * @param  {String} name
   * @param  {functionPromise} cacheFunction
   * @return {Unknown}
   */
  action(name, cacheFunction) {
    return new Promise(async (resolve, reject)=>{
      try {
        let cache = await this._get(name)
        if(cache==undefined){
          cache = await cacheFunction()
          await this._set(name, cache);
        }
        resolve(cache);
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [sql run the sql statement if the value of sql statement is not defined and save the value to the cache]
   * @param  {String} sql
   * @return {Array}
   */
  sql(sql){
    return new Promise((resolve, reject)=>{
      try {
        this.action(sql, () => new Promise(async (resolve, reject) => {
          try {
            let rows = await db.promiseQuery(sql);
            resolve(rows);
          } catch (err) {
            reject(err)
          }
        })).then(resolve).catch(reject)
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

}

module.exports = Cache;
