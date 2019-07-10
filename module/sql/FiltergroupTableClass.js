const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class FiltergroupTableClass extends Core{

  constructor() {
    super();
    this.table = "filtergroup";
  }

  /**
   * [createTable create table filtergroup]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `NAME` VARCHAR(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add create new entry]
   * @param  {String} name
   * @return {Promise}
   */
  add(name){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`NAME`) VALUES ?", [[[name]]]);
  }

  /**
   * [change colume `NAME` by id]
   * @param  {Integer} id
   * @param  {String} name
   * @return {Promise}
   */
  change(id, name){
    return db.promiseQuery("UPDATE `"+this.table+"` `filtergroup` SET `NAME` = '"+name+"' WHERE `ID` = "+id);
  }

  /**
   * [remove // delete entry by id]
   * @param  {Integer} id
   * @return {Promise}
   */
  remove(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [getAll get all groups with filter and there settings]
   * @param  {Integer} user_id
   * @return {Array}
   */
  getAll(user_id){
    return db.promiseQuery("SELECT DISTINCT fg.* FROM `users` AS u, `users2project` AS u2p, `filtergroup` as fg, `filtergroup2project` as fg2p WHERE fg2p.`GROUP_ID` = fg.`ID` AND fg2p.`PROJECT_ID` = u2p.`PROJECT_ID` AND u2p.`USER_ID` = "+user_id+" and u.`ID` = "+user_id+" or u.`ADMIN` = 1");
  }



}//class
