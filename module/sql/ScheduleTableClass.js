const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');



module.exports = class ScheduleTableClass extends Core{

  constructor() {
    super();
    this.table = "schedule";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL DEFAULT '0' , `START` INT(255) NOT NULL DEFAULT '0' , `END` INT(255) NOT NULL DEFAULT '1440' , `SUN` BOOLEAN NOT NULL DEFAULT TRUE , `MON` BOOLEAN NOT NULL DEFAULT TRUE , `TUE` BOOLEAN NOT NULL DEFAULT TRUE , `WED` BOOLEAN NOT NULL DEFAULT TRUE , `THU` BOOLEAN NOT NULL DEFAULT TRUE , `FRI` BOOLEAN NOT NULL DEFAULT TRUE , `SAT` BOOLEAN NOT NULL DEFAULT TRUE , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [create schedule-entry for project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  create(project_id){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`) VALUES ?", [[[project_id]]]);
  }

  /**
   * [is // check table for entry with PROJECT_ID]
   * @param  {Integer}  project_id
   * @return {Boolean}
   */
  is(project_id){
    return db.promiseQuery("SELECT count(`ID`) as count FROM `"+this.table+"` WHERE `PROJECT_ID` = '"+project_id+"'");
  }

  /**
   * [fetch delivers settings of project-schedule]
   * @param  {Integer/Array} project_id
   * @return {Promise}
   */
  fetch(project_id=[]){
    return db.promiseQuery("SELECT `PROJECT_ID`, `START`, `END`, `SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT` FROM `"+this.table+"` WHERE `PROJECT_ID` in ("+project_id.join(',')+")");
  }

  /**
   * [set // merg and change colume]
   * @param {Integer} project_id
   * @param {Object} options    [e.g. { START: 1, END: 2, SUN: false, MON..}, default: {}]
   * @return {Promise}
   */
  set(project_id, options={}){
    options = Object.assign({ START: 1, END: 2, SUN: false, MON: false, TUE: false, WED: false, THU: false, FRI: false, SAT: false }, options);

    let sql = "UPDATE `"+this.table+"` SET";
    for (let colume in options){
      if(sql.length>21) sql += ',';
      sql += " `"+colume+"` = '"+(typeof options[colume]!=='boolean'? options[colume]: options[colume]===true? 1: 0)+"'";
    }
    sql += ' WHERE `PROJECT_ID` = '+project_id;
    return db.promiseQuery(sql);
  }

  /**
   * [remove delete entry for project]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  remove(project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

}//class
