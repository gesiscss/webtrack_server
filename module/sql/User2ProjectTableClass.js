const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class User2ProjectTableClass extends Core{

  constructor() {
    super();
    this.table = "users2project";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `USER_ID` INT(255) NOT NULL , `PROJECT_ID` INT(255) NOT NULL , `ADMIN` BOOLEAN NOT NULL DEFAULT FALSE , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add // insert new entry]
   * @param {Integer}  user_id
   * @param {Integer}  project_id
   * @param {Boolean} isAdmin
   * @param {Promise}
   */
  add(user_id, project_id, isAdmin){
    console.log(user_id, project_id, isAdmin);
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`USER_ID`, `PROJECT_ID`, `ADMIN`) VALUES ?", [[[user_id, project_id, isAdmin]]]);
  }

  /**
   * [change // update colume]
   * @param {Integer}  user_id
   * @param {Integer}  project_id
   * @param {Boolean} isAdmin
   * @param {Promise}
   */
  change(user_id, project_id, isAdmin){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `ADMIN` = '"+isAdmin+"' WHERE `USER_ID` = "+user_id+" AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [isAdmin return colume ADMIN from entry there coupled with user_id and project_id]
   * @param {Integer}  user_id
   * @param {Integer}  project_id
   * @return {Promise}
   */
  isAdmin(user_id, project_id){
    return db.promiseQuery("(SELECT `ADMIN` FROM `"+this.table+"` WHERE `USER_ID` = "+user_id+" and `PROJECT_ID` = "+project_id+") UNION (SELECT u.`ADMIN` as ADMIN FROM `users` AS u WHERE u.`ID` = "+user_id+" AND u.`ADMIN` = 1)");
  }

  /**
   * [is return count of ID where user_id coupled with project_ids]
   * @param  {Integer}  user_id
   * @param  {Array}   project_ids [default: []]
   * @return {Promise}
   */
  is(user_id, project_ids=[]){
    return db.promiseQuery("SELECT count(`ID`) as count FROM `"+this.table+"` WHERE `USER_ID` = "+user_id+" and `PROJECT_ID` in ("+project_ids.join(',')+")");
  }

  /**
   * [removeProject delete all entrys by project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  removeProject(project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * [remove delete entry by coupled user_id with project_id]
   * @param  {Integer}  user_id
   * @param  {Integer}  project_id
   * @return {Promise}
   */
  remove(user_id, project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `USER_ID` = "+user_id+" AND `PROJECT_ID` = "+project_id);
  }


}//class
