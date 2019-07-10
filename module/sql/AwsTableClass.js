const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class AwsTableClass extends Core{

  constructor() {
    super();
    this.table = "aws";
  }

  /**
   * [install Create table]
   * @return {Boolean}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `WRITEONLY_NAME` VARCHAR(255) NOT NULL , `WRITEONLY_ACCESSKEYID` VARCHAR(20) NOT NULL , `WRITEONLY_SECRETACCESSKEY` VARCHAR(40) NOT NULL , `FULLRIGTH_NAME` VARCHAR(255) NOT NULL , `FULLRIGTH_ACCESSKEYID` VARCHAR(20) NOT NULL , `FULLRIGTH_SECRETACCESSKEY` VARCHAR(40) NOT NULL , `BUCKET` VARCHAR(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add set the settings of aws and return insertId]
   * @param {String} writeonly_name
   * @param {String} writeonly_accesskeyid
   * @param {String} writeonly_secretaccesskey
   * @param {String} fullrigth_name
   * @param {String} fullrigth_accesskeyid
   * @param {String} fullrigth_secretaccesskey
   * @param {String} bucket
   * @return {Promise} Integer
   */
  add(writeonly_name, writeonly_accesskeyid, writeonly_secretaccesskey, fullrigth_name, fullrigth_accesskeyid, fullrigth_secretaccesskey, bucket){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery(
          "INSERT INTO `"+this.table+"` (`WRITEONLY_NAME`, `WRITEONLY_ACCESSKEYID`, `WRITEONLY_SECRETACCESSKEY`, `FULLRIGTH_NAME`, `FULLRIGTH_ACCESSKEYID`, `FULLRIGTH_SECRETACCESSKEY`, `BUCKET`) VALUES ?",
          [[[writeonly_name, writeonly_accesskeyid, writeonly_secretaccesskey, fullrigth_name, fullrigth_accesskeyid, fullrigth_secretaccesskey, bucket]]]);
          resolve(rows.insertId)
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [get return the entry of id]
   * @param  {Integer} id
   * @return {Promise} Object
   */
  get(id){
    return db.promiseQuery("SELECT `WRITEONLY_NAME`, `WRITEONLY_ACCESSKEYID`, `WRITEONLY_SECRETACCESSKEY`, `FULLRIGTH_NAME`, `FULLRIGTH_ACCESSKEYID`, `FULLRIGTH_SECRETACCESSKEY`, `BUCKET` FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [remove delete the entry of id]
   * @param  {Integer} id
   * @return {Promise} Object
   */
  remove(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = "+id);
  }


  /**
   * [change check the colume if they exist and change the colume of entry from id]
   * @param  {Integer} id
   * @param  {Object} settings
   * @return {Promise} Object
   */
  change(id, settings){
    let sql = 'UPDATE `'+this.table+'` SET';
    for (let colume in settings){
      if(['WRITEONLY_NAME', 'WRITEONLY_ACCESSKEYID', 'WRITEONLY_SECRETACCESSKEY', 'FULLRIGTH_NAME', 'FULLRIGTH_ACCESSKEYID', 'FULLRIGTH_SECRETACCESSKEY', 'BUCKET'].includes(colume))
      sql += "`"+colume+"` = '"+settings[colume]+"',";
    }
    sql = sql.substring(0, sql.length - 1);
    sql += ' WHERE `ID` = '+id;
    return db.promiseQuery(sql);
  }

}//class
