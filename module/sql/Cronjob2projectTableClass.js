const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');
var moment = require('moment');


module.exports = class Cronjob2projectTableClass extends Core{

  constructor() {
    super();
    this.table = "cronjob2project";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL , `TYPE` VARCHAR(255) NOT NULL , `SECINTERVAL` INT(255) NULL DEFAULT '900' , `ACTIVE` BOOLEAN NOT NULL DEFAULT FALSE , `ENABLE` BOOLEAN NOT NULL DEFAULT TRUE , `LASTACTIVITY` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [is return count of TYPE where type coupled with project_id]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @return {Promise}
   */
  is(project_id, type){
    return db.promiseQuery("SELECT count(`TYPE`) as count FROM `"+this.table+"` WHERE `TYPE` = '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [getList return all entrys]
   * @return {Promise}
   */
  getList(){
    return db.promiseQuery("SELECT * FROM `"+this.table+"`");
  }

  /**
   * [getSettings return entrys where project_id coupled with type]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @return {Promise}
   */
  getSettings(project_id, type){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [add insert new entry]
   * @param {Integer} project_id
   * @param {String}  type
   * @param {Integer} interval       [default: 900]
   * @param {Integer} active         [default: 0]
   * @param {Integer} enable         [default: 0]
   * @param {Promise}
   */
  add(project_id, type, interval=900, active=0, enable=0){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`, `TYPE`, `SECINTERVAL`, `ACTIVE`, `ENABLE`) VALUES ?", [[[project_id, type, interval, active? 1: 0, enable? 1: 0]]]);
  }

  /**
   * [remove entry where project_id coupled with type]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @return {Promise}
   */
  remove(project_id, type){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [setEnable change colume ENABLE]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @param {Boolean} boolean [default: true]
   * @return {Promise}
   */
  setEnable(project_id, type, boolean=true){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `ENABLE` = '"+(boolean? 1: 0)+"' WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [setInterval change colume SECINTERVAL]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @param  {Integer} number     [default: 5]
   * @return {Promise}
   */
  setInterval(project_id, type, number=5){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `SECINTERVAL` = '"+number+"' WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [setActive change colume ACTIVE]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @param {Boolean} boolean    [default: false]
   * @return {Promise}
   */
  setActive(project_id, type, boolean=false){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `ACTIVE` = '"+(boolean? 1: 0)+"' WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [isActive return ACTIVE colume by project_id coupled with type]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @return {Promise}
   */
  isActive(project_id, type){
    return db.promiseQuery("SELECT `ACTIVE` FROM `"+this.table+"` WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }

  /**
   * [updateActivity update colume LASTACTIVITY with new Datetime]
   * @param  {Integer}  project_id
   * @param  {String}  type
   * @return {[type]}            [description]
   */
  updateActivity(project_id, type){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `LASTACTIVITY` = '"+(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))+"' WHERE `TYPE` like '"+type+"' AND `PROJECT_ID` = "+project_id);
  }



}//class
