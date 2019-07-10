const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


module.exports = class ProjektTableClass extends Core{

  constructor() {
    super();
    this.table = "project";
  }

  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT, `NAME` VARCHAR(255) NOT NULL, `DESCRIPTION` TEXT NOT NULL, `ACTIVE` BOOLEAN NOT NULL DEFAULT FALSE, `SCHEDULE` BOOLEAN NOT NULL DEFAULT FALSE, `ENTERID` BOOLEAN NOT NULL DEFAULT TRUE, `CHECK_CLIENTIDS` BOOLEAN NOT NULL DEFAULT FALSE, `SENDDATAAUTOMATICALLY` BOOLEAN NOT NULL DEFAULT TRUE, `PRIVATEBUTTON` BOOLEAN NOT NULL DEFAULT TRUE, `SHOWHISTORY` BOOLEAN NOT NULL DEFAULT TRUE, `EDITHISTORY` BOOLEAN NOT NULL DEFAULT FALSE, `SHOW_DOMAIN_HINT` BOOLEAN NOT NULL DEFAULT FALSE, `FORGOT_ID` BOOLEAN NOT NULL DEFAULT FALSE, `PRIVATETAB` BOOLEAN NOT NULL DEFAULT FALSE, `ACTIVE_URLLIST` BOOLEAN NOT NULL DEFAULT FALSE, `URLLIST_WHITE_OR_BLACK` BOOLEAN NOT NULL DEFAULT TRUE, `EXTENSIONSFILTER` VARCHAR(255) NOT NULL DEFAULT '{\"all\":false,\"js\":false,\"css\":false,\"img\":false,\"video\":false, \"music\":false}',  `STORAGE_DESTINATION` BOOLEAN NOT NULL DEFAULT FALSE, `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`ID`) ) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add create new project]
   * @param  {String} name
   * @param {String} description
   * @return {Promise} Number // return InsertId
   */
  add(name, description){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`NAME`, `DESCRIPTION`) VALUES ?", [[[name, description]]]);
  }

  /**
   * [change chage name and description entry from db]
   * @param  {Integer} id
   * @param  {String} name
   * @param  {String} description
   * @return {Promise}
   */
  change(id, name, description){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `NAME`='"+name+"', `DESCRIPTION`='"+description+"' WHERE `ID` = "+id);
  }

  /**
   * [delete Delete project in db]
   * @param  {Integer} id
   * @return {Boolean}
   */
  delete(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [getAll checked id permisson & delivers all projects]
   * @param  {Integer} user_id
   * @return {Array}
   */
  getAll(user_id){
    return db.promiseQuery("(SELECT p.* FROM `"+this.table+"` as p, `users2project` AS u2p WHERE u2p.`USER_ID` = "+user_id+" AND p.`ID` = u2p.`PROJECT_ID`) UNION (SELECT p.* FROM `"+this.table+"` as p, `users` AS u WHERE u.`ID` = "+user_id+" AND u.`ADMIN` = 1)")
  }

  /**
   * [getAktiv return all aktiv projects]
   * @return {Array} rows
   */
  getAktiv(){
    return db.promiseQuery("SELECT `ID`, `NAME`, `DESCRIPTION`, `SCHEDULE` FROM `"+this.table+"` WHERE `ACTIVE` = 1");
  }

  /**
   * [get return project columes]
   * @param  {Integer}  id
   * @return {Object}
   */
  get(id){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [getAllIds return list of all projects]
   * @return {Promise}
   */
  getAllIds(){
    return db.promiseQuery("SELECT `ID` FROM `"+this.table+"`");
  }


  /**
   * [getPermissions return all user have access to the Project]
   * @param  {Integer} id
   * @return {Array}
   */
  getPermissions(id){
    return db.promiseQuery("SELECT  u.`ID`, u.`NAME`, u2p.`ADMIN`, u2p.`CREATEDATE` FROM `users` AS u, `users2project` AS u2p WHERE u2p.`USER_ID` = u.`ID` AND u2p.`PROJECT_ID` = "+id);
  }


}//class
