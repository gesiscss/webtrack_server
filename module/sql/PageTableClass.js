const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');
var moment = require('moment');

module.exports = class PageTableClass extends Core{

  constructor() {
    super();
    this.table = "page";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL , `CLIENT_ID` INT(255) NOT NULL , `CLIENT_PAGE_ID` VARCHAR(255) NOT NULL DEFAULT '0', `CLIENT_PRECURSOR_ID` VARCHAR(255) NULL DEFAULT NULL, `PRECURSOR_ID` INT(255) NOT NULL , `URL` TEXT NOT NULL , `TITLE` TEXT CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL, `DESCRIPTION` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci NOT NULL , `KEYWORDS` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci NOT NULL , `DURATION` INT(255) NOT NULL DEFAULT '0' , `STARTTIME` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, `TYPEVERSION` VARCHAR(255) NULL DEFAULT NULL,  PRIMARY KEY (`ID`), INDEX starttime_idx (`STARTTIME`), INDEX client_idx (`CLIENT_ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [delete entry by id]
   * @param  {Integer} id
   * @return {Promise}
   */
  delete(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [getPrecursorId return id with client_id and precursor_id]
   * @param  {Integer} client_id
   * @param  {String} precursor_id
   * @return {Promise}
   */
  getPrecursorId(client_id, precursor_id){
    return db.promiseQuery("SELECT `ID` FROM `"+this.table+"` WHERE `CLIENT_ID` = '"+client_id+"' AND `CLIENT_PAGE_ID` = '"+precursor_id+"'");
  }

  /**
   * [setPrecursorId return list of entrys]
   * @param {Array} ids
   * @param {Integer} precursorId
   * @return {Promise}
   */
  setPrecursorId(ids, precursorId){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `PRECURSOR_ID` = '"+precursorId+"' WHERE `ID` in ("+ids.join(',')+")");
  }

  /**
   * [hasPageClient_PrecursorId provides all children pages that are dependent on the parents page]
   * @param  {Integer}  client_id
   * @param  {Integer}  client_page_id
   * @return {Promise}
   */
  hasPageClient_PrecursorId(client_id, client_page_id){
    return db.promiseQuery("SELECT `ID` FROM `"+this.table+"` WHERE `CLIENT_PRECURSOR_ID` = '"+client_page_id+"' AND  `CLIENT_ID` = '"+client_id+"' AND `PRECURSOR_ID` = 0");
  }

  /**
   * [getChildren return list of Ids with the same precursorId]
   * @param  {Integer} id
   * @return {Promise}
   */
  getChildren(id){
    return db.promiseQuery("SELECT `ID` FROM `"+this.table+"` WHERE `PRECURSOR_ID` = "+id);
  }

  /**
   * [insert new entry]
   * @param {Integer} project_id
   * @param {Integer} client_id
   * @param {Integer} id
   * @param {String} client_precursor_id
   * @param {Integer} precursor_id
   * @param {String} url
   * @param {String} title
   * @param {Integer} duration
   * @param {Date} start
   * @param {String} versionType
   * @return {Promise}
   */
  create(project_id, client_id, id, client_precursor_id, precursor_id, url, title, duration, start, description, keywords, versionType){
    return new Promise(async (resolve, reject) => {
      try {
        //let connection = await db._getConnect();
        let r = await db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`, `CLIENT_ID`, `CLIENT_PAGE_ID`, `CLIENT_PRECURSOR_ID`, `PRECURSOR_ID`, `URL`, `TITLE`, `DURATION`, `STARTTIME`, `DESCRIPTION`, `KEYWORDS`, `TYPEVERSION`) VALUES ?", [[[project_id, client_id, id, client_precursor_id, precursor_id, url, title, duration, moment(start).format('YYYY-MM-DD HH:mm:ss'), '', '', versionType]]]);
        //connection.release();
        resolve(r);
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * [getClientPages return entry by client_id]
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Promise}
   */
  getClientPages(project_id, client_id){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `CLIENT_ID` = "+client_id+" and `PROJECT_ID` = "+project_id);
  }

  /**
   * [getClientPages return entry by id]
   * @param  {Integer} id
   * @return {Promise}
   */
  get(id){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [_getClientIds2Project return list of all involved clients to the project]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  _getClientIds2Project(project_id){
    return db.promiseQuery("SELECT DISTINCT `CLIENT_ID` FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Promise}
   */
  getMAXActivity(client_id, project_id){
    return db.promiseQuery("SELECT MAX(`CREATEDATE`) as ACTIVITY FROM `"+this.table+"` WHERE `CLIENT_ID` = '"+client_id+"' and `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Promise}
   */
  getCountPage(client_id, project_id){
    return db.promiseQuery("SELECT COUNT(`CLIENT_ID`) as COUNTPAGE FROM `"+this.table+"` WHERE `CLIENT_ID` = '"+client_id+"' and `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getMinDuration(project_id){
    return db.promiseQuery("SELECT MIN(`DURATION`) as value FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getMaxDuration(project_id){
    return db.promiseQuery("SELECT MAX(`DURATION`) as value FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getMinStarttime(project_id){
    return db.promiseQuery("SELECT MIN(`STARTTIME`) as value FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getMaxStarttime(project_id){
    return db.promiseQuery("SELECT MAX(`STARTTIME`) as value FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getMinCreateDate(project_id){
    return db.promiseQuery("SELECT MIN(`CREATEDATE`) as value FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getMaxCreateDate(project_id){
    return db.promiseQuery("SELECT MAX(`CREATEDATE`) as value FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }


}//class
