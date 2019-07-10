"use strict";
const db = require('../lib/Db.js');
var crypto = require('crypto');

class Core {

  constructor() {
    this.table = null;
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
   * [isName checks column `ǸAME` as entry exist]
   * @param  {String}  name
   * @return {Boolean}
   */
  isName(name){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await db.promiseQuery("SELECT count(`NAME`) as count FROM `"+this.table+"` WHERE `NAME` like '"+name+"'");
        resolve(rows[0].count>0? rows[0].count: false)
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * [isId checks column `ID` as entry exist]
   * @param  {Integer}  id
   * @return {Boolean}
   */
  isId(id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await db.promiseQuery("SELECT count(`ID`) as count FROM `"+this.table+"` WHERE `ID` = '"+id+"'");
        resolve(rows.length>0 && rows[0].count>0? rows[0].count: false)
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * [sortByColume sort array to Object with hash-index colume]
   * @param  {String} colume
   * @param  {Array} rows
   * @return {Object} c
   */
  sortByColume(colume, rows){
    let c = {};
    for (let r of rows){
      c[r[colume]] = r;
      delete r[colume];
    }
    return c
  }

}

module.exports = Core;
