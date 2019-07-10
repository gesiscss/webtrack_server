const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


module.exports = class UrllistTableClass extends Core{

  constructor() {
    super();
    this.table = "urllist";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL , `URL` VARCHAR(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [_getListforProject return all PROJECT_ID with URL coupled with project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  _getListforProject(project_id=[]){
    return db.promiseQuery("SELECT `PROJECT_ID`, `URL` FROM `"+this.table+"` WHERE `PROJECT_ID` in ("+project_id.join(',')+")");
  }

  /**
   * [get return entrys with rang, sorted or filtered options]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array}   range
   * @param  {Object}  sorted
   * @param  {Object}  filtered
   * @return {Array}
   */
  get(project_id, range=[], sorted=[], filtered=[]){

    let sql = "SELECT `URL`, `ID`, `CREATEDATE` FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id;
    if(filtered.length>0){
        for (let f of filtered) sql += ' AND `'+f.id+'` LIKE "%'+f.value+'%"';
    }
    if(sorted.length>0){
        for (let s of sorted) sql += ' ORDER BY `'+s.id+'` '+(s.desc? 'DESC': 'ASC');
    }
    if(range.length === 2 && typeof range[0] === 'number' && typeof range[1] === 'number') sql += ' LIMIT '+range[0]+','+range[1];

    return db.promiseQuery(sql);
  }

  /**
   * [add new entry]
   * @param {Integer} project_id
   * @param {Array}  values [default: []]
   */
  add(project_id, values=[]){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`, `URL`) VALUES ?", [values]);
  }

  /**
   * [change update entry by id]
   * @param  {Integer} id
   * @param  {String} url
   * @return {Promise}
   */
  change(id, url){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `URL` = '"+url+"' WHERE `ID` = "+id);
  }

  /**
   * [getCount return count of ID with coupled with project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getCount(project_id){
    return db.promiseQuery("SELECT count(`ID`) as count FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
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
   * [delete all entrys by project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  clean(project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` ="+project_id);
  }


}//class
