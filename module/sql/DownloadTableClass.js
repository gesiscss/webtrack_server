const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');



module.exports = class DownloadTableClass extends Core{

  constructor(props) {
    super(props);
    this.table = "download";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `PROJECT_ID` INT(255) NOT NULL , `USER_ID` INT(1) NOT NULL , `LEVEL` INT(255) NOT NULL DEFAULT '1' , `FILTER_IDS` VARCHAR(255) NOT NULL DEFAULT '[]' , `FILE` LONGBLOB NULL DEFAULT NULL , `COUNT` INT(1) NOT NULL DEFAULT '0', `ERROR` LONGTEXT NULL DEFAULT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add insert new entry]
   * @param {Integer} project_id
   * @param {Integer} user_id
   * @param {Number} level       [default: 1]
   * @param {Array}  filter_ids  [default: []]
   */
  add(project_id, user_id, level=1, filter_ids=[]){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`, `USER_ID`, `LEVEL`, `FILTER_IDS`) VALUES ?", [[[project_id, user_id, level, JSON.stringify(filter_ids)]]]);
  }

  /**
   * [setCount update colume count]
   * @param {Integer} id
   * @param {Number} count [default: 1]
   * @return Promise
   */
  setCount(id, count=1){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `COUNT` = '"+count+"' WHERE `ID` = "+id+";");
  }

  /**
   * [getCount return list of colume counts]
   * @param  {Integer} id
   * @return Promise
   */
  getCount(id){
    return db.promiseQuery("SELECT `COUNT` FROM `"+this.table+"` WHERE `ID` = "+id+";");
  }

  /**
   * [updateError update colume Error]
   * @param  {Integer} id
   * @param  {String} error     [default: '']
   * @return {Promise}
   */
  updateError(id, error=''){
    return new Promise(async (resolve, reject) => {
      try {
        let connection = await db._getConnect();
        await db.promiseQuery("UPDATE `"+this.table+"` SET `ERROR` = "+connection.escape(error)+" WHERE `ID` = "+id+";");
        connection.release();
        resolve();
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * [delete entry of id]
   * @param  {Integer} id
   * @return {Promise}
   */
  delete(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = '"+id+"'");
  }

  /**
   * [updateFile update colume entry with buffer-object]
   * @param  {Integer} id
   * @param  {Buffer} buffer
   * @return {Promise}
   */
  updateFile(id, buffer){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `FILE` = ? WHERE `ID` = ?", [buffer, id]);
  }

  /**
   * [getFile return buffer from colume FILE]
   * @param  {Integer} id
   * @return {Promise}
   */
  getFile(id){
    return db.promiseQuery("SELECT `FILE` FROM `"+this.table+"` WHERE `ID` = "+id+";");
  }

  /**
   * [getList return list of download entrys by project_id]
   * @param  {project_id} id
   * @return {Promise}
   */
  getList(project_id){
    return db.promiseQuery("SELECT (case when (`"+this.table+"`.`FILE` IS NULL) THEN 0 ELSE 1 END) as IS_FILE, `"+this.table+"`.`ERROR` as ERROR, `"+this.table+"`.`ID` as ID, `users`.`NAME` as USERNAME, `"+this.table+"`.`CREATEDATE` as CREATEDATE FROM `"+this.table+"`, `users` WHERE `users`.`ID` = `"+this.table+"`.`USER_ID` and `"+this.table+"`.`PROJECT_ID` = '"+project_id+"' ORDER BY `CREATEDATE` DESC");
  }

  /**
   * [deleteByProject delete all entrys by project_id]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  deleteByProject(project_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` = '"+project_id+"'");
  }

  /**
   * [get return list of columes by id]
   * @param  {Integer} id
   * @return {Promise}
   */
  get(id){
    return db.promiseQuery("SELECT `PROJECT_ID`, `USER_ID`, `LEVEL`, `FILTER_IDS` FROM `"+this.table+"` WHERE `ID` = "+id);
  }

}//class
