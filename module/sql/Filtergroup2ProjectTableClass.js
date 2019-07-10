const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


module.exports = class Filtergroup2ProjectTableClass extends Core{

  constructor() {
    super();
    this.table = "filtergroup2project";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL , `GROUP_ID` INT(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add groupid to project]
   * @param {Integer}  group_id
   * @param {Integer}  project_id
   * @return {Promise}
   */
  add(group_id, project_id){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`GROUP_ID`, `PROJECT_ID`) VALUES ? ", [[[group_id, project_id]]]);
  }

  /**
   * [getProjectIDtoGroupId return all project_ids where group_id found]
   * @param  {Integer} group_id
   * @return {Promise}
   */
  getProjectIDtoGroupId(group_id){
    return db.promiseQuery("SELECT `PROJECT_ID` FROM `"+this.table+"` WHERE `GROUP_ID` = "+group_id);
  }

  /**
   * [is return count of coupled group-id with project-id]
   * @param  {Integer}  group_id
   * @param  {Integer}  project_id
   * @return {Promise}
   */
  is(group_id, project_id){
    return db.promiseQuery("SELECT count(`ID`) as count FROM `"+this.table+"` WHERE `GROUP_ID` = "+group_id+" and `PROJECT_ID` = "+project_id);
  }

  /**
   * [removeProject delete all entrys with coupled project-id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  removeProject(project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * [removeGroup remove group-id from table]
   * @param  {Integer} group_id
   * @return {Promise}
   */
  removeGroup(group_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `GROUP_ID` = "+group_id);
  }



}//class
