const db = require('../lib/Db.js');

module.exports = class Events2Data {

  constructor() {
    this.table = 'events2data';
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `EVENT_ID` INT(255) NOT NULL , `NAME` VARCHAR(255) NOT NULL , `VALUE_TYPE` VARCHAR(255) NOT NULL , `VALUE` MEDIUMTEXT NOT NULL , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;")
  }

  /**
   * [add insert new entrys]
   * @param {Integer} eventId
   * @param {Array}  values    [default: []]
   * @return {Promise}
   */
  add(eventId, values=[]){
    return new Promise(async (resolve, reject) => {
      try {
        let connection = await db._getConnect();
        let input = []
        for (let v of values) {
          input.push([eventId, v.name, typeof v.value, connection.escape(v.value)])
        }
        connection.release();
        resolve(await db.promiseQuery("INSERT INTO `"+this.table+"` (`EVENT_ID`, `NAME`, `VALUE_TYPE`, `VALUE`) VALUES ?", [input]))
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [get return entrys by id]
   * @param  {Integer} eventId [description]
   * @return {Promise}
   */
  get(eventId){
    return new Promise(async (resolve, reject) => {
      try {
        let values = await db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `EVENT_ID` = " + eventId);
        for (let v of values) {
          switch (v.VALUE_TYPE) {
            case 'number':
              v.VALUE = parseInt(v.VALUE, 10);
              break;
            default:
          }
          delete v.VALUE_TYPE;
        }
        resolve(values);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [remove entrys with list of ids]
   * @param  {Array}  eventIds [default: []]
   * @return {Promise}
   */
  remove(eventIds=[]){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `EVENT_ID` IN ("+eventIds.join(',')+")");
  }

}//class
