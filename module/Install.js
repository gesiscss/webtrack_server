"use strict";
var db = require('../module/lib/Db.js');
var Config = require('../module/lib/Config.js');
var users = require('../module/users.js');
var tokenHandler = require('../module/lib/tokenHandler.js');
var fs = require('fs');
var path = require('path');
const MODULE_PATH = './module/sql';

class Install extends Config{

  /**
   * [_installModuls search all in MODULE_PATH-folder files and run _installModul]
   * @return {Promise}
   */
  _createTables(){
    return new Promise((resolve, reject)=>{
      fs.readdir(path.resolve(MODULE_PATH), async (err, list) => {
        try {
          let tables = list.filter(e => e.substring(0, 1)!='#');
          for (let file of tables) {
            let _filePath = path.resolve(MODULE_PATH+'/'+file);
            if(!fs.lstatSync(_filePath).isFile()) continue;
            let o = require(_filePath);
            if(typeof o==='function' && o.toString().includes('class')){
              var constructors = {
                 [o.prototype.constructor.name]: o,
              };
              o = new constructors[o.prototype.constructor.name]();
            }
            if(o.createTable!==undefined){
              console.log('Table '+o.constructor.name+' create');
              await o.createTable()
            }
          }
          setTimeout(resolve, 2000);
        } catch (e) {
            reject(e)
        }
      });
    });
  }


  /**
   * [create
   * - check DB-connection with db-credentials
   * - save db-credentials in config.JSON
   * - reconnect db connection
   * - create user and return token-auth
   * ]
   * @param  {Object} credentials [{MYSQL_HOST: '', MYSQL_USER: '' ...}]
   * @return {Promise} token-auth
   */
  create(credentials){
    return new Promise(async (resolve, reject)=>{
      try {
        let settings = {MYSQL_HOST: credentials.MYSQL_HOST, MYSQL_USER: credentials.MYSQL_USER, MYSQL_PASSWORD: credentials.MYSQL_PASSWORD, MYSQL_DATABASE: credentials.MYSQL_DATABASE};
        await db.check(settings);
        console.log('Connection success');
        await this._update(settings);
        console.log('Update config.js success');
        await db._init();
        console.log('Update db Configuration');
        db.installMode = true;
        await this._createTables();
        console.log('Create tables success');
        let e = await users.add({loginname: credentials.username, password: credentials.password, admin: 1, enable: 1});
        console.log('Create user success');
        await this._update({INSTALL: true});
        console.log('Set Install');
        db.installMode = false;
        let r = await tokenHandler.sign({name: credentials.username, id: e.insertId, admin: true, enable: true});
        console.log('Get token');
        resolve(r);
      } catch (e) {
        db.installMode = false;
        reject(e)
      }
    });
  }


}

module.exports = new Install();
