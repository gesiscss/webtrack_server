const fs = require('fs');
const fdb = require('file-db');
const path = require('path');
const crypto = require('crypto');
const rimraf = require('rimraf');


class URLRessource {

  constructor() {
    try {
      this.IDS = 'urlRessource';
      this.CORE_PATH = path.resolve(__dirname, '..');
      this.FOLDER_PATH = path.resolve(this.CORE_PATH, this.IDS);
    } catch (e) {
      Promise.reject(e)
    }
  }

  async _test(){
    try {
      let id = 10;
      let source = [
        {url: 'www.url.de', data: 'yxdsdfg4r'},
        {url: 'www.url.de2', data: 'sdfs43e'}
      ]
      if(await this.isId(id)){
        console.log('Lösche');
        this.remove(id);
      }
      console.log('Erstelle');
      await this.create(id, source);
      console.log('Hole');
      console.log(await this.get(id));
      console.log('Lösche');
      await this.delete(id);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * [_getDB return db object]
   * @return {Promise} Object
   */
  _getDB(){
    return new Promise((resolve, reject) => {
      fdb.open(this.CORE_PATH, (err, db) => {
        if(err!=null){
          reject(err)
        }else{
          resolve(db)
        }
      });
    });
  }


  /**
   * [isId check if id exist]
   * @param  {Promise}  id
   * @return {Promise} Boolean
   */
  isId(id){
    return new Promise(async (resolve, reject) => {
      try {
        id = id.toString();
        let db = await this._getDB();
        if (!fs.existsSync(this.FOLDER_PATH)){
          resolve(false);
        }else{
          let ids = fs.readdirSync(this.FOLDER_PATH);
          resolve(ids.includes(id));
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [create folder with data from id]
   * @param  {id} id
   * @param  {Array} source
   * @return {Promise}
   */
  create(id, source){
    return new Promise(async (resolve, reject) => {
      try {
        let db = await this._getDB();
        db.use(this.IDS).save({ _id: id.toString() }).save(source).exec((err, result) => {
          if(err != null){
            reject(err)
          }else{
            resolve(true)
          }
        });
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * [get Data from ID]
   * @param  {String} id
   * @return {Promise} Array
   */
  get(id){
    return new Promise(async (resolve, reject) => {
      try {
          id = id.toString();
          if(await this.isId(id)){
            let db = await this._getDB();
            db.use(this.IDS).findById(id).exec((err, result) => {
              if(err != null){
                reject(err)
              }else{
                resolve(Object.values(result)
                              .filter(e => typeof e == 'object')
                              .map(e => {
                                delete e._id;
                                return e;
                              }))
              }
            })
          }else{
            throw new Error('Id not found')
          }
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * [remove delete data from id]
   * @param  {String} id
   * @return {Promise}
   */
  delete(id){
    return new Promise(async (resolve, reject) => {
      try {
        id = path.resolve(this.FOLDER_PATH, id.toString())
        if(fs.existsSync(id)){
          rimraf.sync(id);
        }
        resolve();
      } catch (err) {
        reject(err)
      }
    })
  }




}

module.exports = new URLRessource();
