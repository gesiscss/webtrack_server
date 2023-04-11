const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');
const Redis = require('redis');

module.exports = class ControlListsTableClass extends Core{

  constructor() {
    super();
    this.table = "controllists";
  }

  /**
   * [createTable create table, populates it from controllist.csv and loads it into redis db 1]
   * @return {Promise}
   */
  async createTable(){
    await db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` (`CLEAN_DOMAIN` VARCHAR(200) PRIMARY KEY, `CRITERIA` TEXT) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
    await this.populateTable();
    return this.loadRedis();
  }

  /**
   * [populates table from csv file]
   * @return {Promise}
   */
  populateTable(){
    return db.promiseQuery("LOAD DATA LOCAL INFILE 'data/controllist.csv' INTO TABLE `"+this.table+"` FIELDS TERMINATED BY ',' IGNORE 1 ROWS;");
  }

  /**
   * [get entry by url]
   * @param  {String} url
   * @return {Promise}
   */
  get(url){
    return db.promiseQuery("SELECT `criteria` FROM `"+this.table+"` WHERE clean_domain = '"+url+"'");
  }

  /**
   * [get all entries in table]
   * @return {Promise}
   */
  getAll(){
    return db.promiseQuery("SELECT * FROM `"+this.table+"`");
  }

  /**
   * [load the table into redis db]
   * @return {Promise}
   */
  async loadRedis() {
    let client = Redis.createClient({db: 1});
    client.on("error", function (err) {
      console.log("Error " + err);
    });
    client.flushdb(); //clearing the controllist from redis on server installation
    let controlList = await this.getAll();
    for (const record in controlList){
      client.set(controlList[record].CLEAN_DOMAIN, controlList[record].CRITERIA);
    };
    client.quit();
  }
}//class
