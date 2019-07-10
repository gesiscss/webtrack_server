const db = require('../lib/Db.js');
var moment = require('moment');

module.exports = class Events2Page{

  constructor() {
    this.table = 'events2page';
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PAGE_ID` INT(255) NOT NULL , `TYPE` VARCHAR(255) NOT NULL , `TIMESTAMP` TIMESTAMP NOT NULL , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;")
  }

  /**
   * [add insert entry]
   * @param {Integer} page_id
   * @param {Integer} type
   * @param {Integer} timestamp
   * @return {Promise}
   */
  add(page_id, type, timestamp){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PAGE_ID`, `TYPE`, `TIMESTAMP`) VALUES ?", [[[page_id, type, moment(timestamp).format('YYYY-MM-DD HH:mm:ss')]]]);
  }

  /**
   * [get return entry of page_id]
   * @param {Integer} page_id
   * @param {Boolean} clean [default: false]
   * @return {Promise}
   */
  get(page_id, clean=false){
    if(clean){
      return db.promiseQuery("SELECT `ID`, `TYPE`, `TIMESTAMP` FROM `"+this.table+"` WHERE `PAGE_ID` = " + page_id);
    }else{
      return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `PAGE_ID` = " + page_id);
    }
  }

  /**
   * [getIds return list of ids from page_id]
   * @param {Integer} page_id
   * @return {Promise}
   */
  getIds(page_id){
    return new Promise(async (resolve, reject) => {
      try {
        resolve((await db.promiseQuery("SELECT `ID`FROM `"+this.table+"` WHERE `PAGE_ID` = " + page_id)).map(e => e.ID))
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [remove // remove entry from ids]
   * @param  {Array}  ids [default: []]
   * @return {Promise}
   */
  remove(ids=[]){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` IN ("+ids.join(',')+")");
  }

  /**
   * [getCount return count of entrys from page_ids]
   * @param  {Array} page_ids
   * @return {Promise} Object
   */
  getCounts(page_ids=[]){
    return new Promise(async (resolve, reject) => {
      try {
        if(page_ids.length==0){
          resolve([])
        }else{
          let sqlState = 'SELECT';
          for (var i = 0; i < page_ids.length; i++) {
            sqlState += " SUM(`PAGE_ID` = "+page_ids[i]+") AS '"+page_ids[i]+"'";
            if(i!=page_ids.length-1) sqlState += ',';
          }
          sqlState += ' FROM `events2page`';
          resolve((await db.promiseQuery(sqlState))[0]);
        }
      } catch (e) {
        reject(e)
      }
    });
  }

}//class
