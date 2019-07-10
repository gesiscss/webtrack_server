const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class UsersTableClass extends Core{

  constructor() {
    super();
    this.table = "users";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` (`ID` INT(255) NOT NULL AUTO_INCREMENT,`NAME` varchar(255) NOT NULL,`ADMIN` tinyint(1) NOT NULL DEFAULT '0',`ENABLE` tinyint(1) NOT NULL DEFAULT '1',`PW_SHA256` text NOT NULL,PRIMARY KEY (`ID`)) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [isAdmin return colunme ADMIN coupled with id]
   * @param  {Integer} id
   * @return {Promise}
   */
  isAdmin(id){
    return db.promiseQuery("SELECT `ADMIN` FROM `"+this.table+"` WHERE `ID` = '"+id+"'");
  }

  /**
   * [get entry by name]
   * @param  {String} name
   * @return {Promise}
   */
  get(name){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE NAME = '"+name+"';");
  }

  /**
   * [isUser return count of colume NAME by coupled NAME]
   * @param  {String}  name
   * @return {Promise}
   */
  isUser(name){
    return db.promiseQuery("SELECT count(`NAME`) as count FROM `"+this.table+"` WHERE `NAME` = '"+name+"';");
  }

  /**
   * [getAll return all entrys]
   * @return {Promise}
   */
  getAll(){
    return db.promiseQuery("SELECT `ID`, `NAME`, `ADMIN`, `ENABLE` FROM `"+this.table+"`");
  }

  /**
   * [add insert new entrys]
   * @param {String} loginname
   * @param {Number} admin         [default: 0]
   * @param {Number} enable        [default: 1]
   * @param {String} password      [default: '']
   */
  add(loginname, admin=0, enable=1, password=''){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`NAME`, `ADMIN`, `ENABLE`, `PW_SHA256`) VALUES ?", [[[loginname, admin, enable, password]]]);
  }

  /**
   * [delete all entrys with same id]
   * @param  {Integer} id
   * @return {Promise}
   */
  del(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [changePw update colume by id]
   * @param  {Integer} id
   * @param  {String} password
   * @return {Promise}
   */
  changePw(id, password){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `PW_SHA256` = '"+password+"' WHERE `ID` = "+id);
  }

  /**
   * [setEnable update colume ENABLE by id]
   * @param {Integer} id
   * @param {Integer} enable [default: 1]
   * @return {Promise}
   */
  setEnable(id, enable=1){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `ENABLE` = '"+enable+"' WHERE `ID` = "+id);
  }

  /**
   * [setAdmin update colume ADMIN by id]
   * @param {Integer} id
   * @param {Integer} admin [default: 1]
   * @return {Promise}
   */
  setAdmin(id, admin=1){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `ADMIN` = '"+admin+"' WHERE `ID` = "+id);
  }


}//class
