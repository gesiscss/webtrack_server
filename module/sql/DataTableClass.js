const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class DataTableClass extends Core{

  constructor() {
    super();
    this.table = "data";
  }

  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PAGE_ID` INT(255) NOT NULL , `VERSION` INT(255) NOT NULL , `HTML` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add // add some HTML-strings to page-IDs]
   * @param {Array} values [e.g. [14, 1, '<html></html>', '2018-06-27 07:31:33']]
   */
  add(values){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PAGE_ID`, `VERSION`, `HTML`, `CREATEDATE`) VALUES ?", [values]);
  }

  /**
   * [get // return page]
   * @param  {Array} page_ids [e.g. [1,4,8]]
   * @return {Promise}
   */
  get(page_ids=[]){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `PAGE_ID` in ("+page_ids.join(',')+")");
  }

  /**
   * [isVersion return count verion]
   * @param  {Integer}  page_id
   * @param  {Integer}  version
   * @return {Promise}
   */
  isVersion(page_id, version){
    return db.promiseQuery("SELECT `ID` as count FROM `"+this.table+"` WHERE `PAGE_ID` = '"+page_id+"' and `VERSION` = '"+version+"'");
  }

  /**
   * [getVersions return list of versions from page]
   * @param  {Integer} page_id
   * @return {Boolean}
   */
  getVersions(page_id){
    return db.promiseQuery("SELECT `VERSION` FROM `"+this.table+"` WHERE `PAGE_ID` = "+page_id);
  }

  /**
   * [getPageVersion return HTML-content from page]
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @return {Boolean}
   */
  getPageVersion(page_id, version){
    return db.promiseQuery("SELECT `HTML` FROM `"+this.table+"` WHERE `PAGE_ID` = '"+page_id+"' and `VERSION` = '"+version+"'");
  }

  /**
   * [delete Data from page-id]
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @return {Promise}
   */
  delete(page_id, version){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PAGE_ID` = '"+page_id+"' and `VERSION` = '"+version+"'");
  }

  /**
   * [deletePage delete all entrys from page_id]
   * @param  {Integer} page_id
   * @return {Promise}
   */
  deletePage(page_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PAGE_ID` = '"+page_id+"'");
  }

}//class
