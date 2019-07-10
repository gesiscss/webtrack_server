const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


module.exports = class StorageDestination2ProjectTableClass extends Core{

  constructor() {
    super();
    this.table = "storagedestination2project";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL , `DESTINATION` VARCHAR(255) NOT NULL , `DESTINATION_ID` INT(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add new entry]
   * @param {Integer} project_id
   * @param {String} destination
   * @param {Integer} destination_id
   * @return {Promise}
   */
  add(project_id, destination, destination_id){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`, `DESTINATION`, `DESTINATION_ID`) VALUES ?", [[[project_id, destination, destination_id]]]);
  }

  /**
   * [get return ID and DESTINATION where project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  get(project_id){
    return db.promiseQuery("SELECT `ID`, `DESTINATION` FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

  /**
   * [remove delete the entry of the project]
   * @param  {Integer} project_id
   * @return {Promise} Object
   */
  remove(project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
  }

}//class
