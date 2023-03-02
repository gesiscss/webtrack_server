const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');
const Redis = require('redis');

module.exports = class WebshrinkerCategoryTableClass extends Core{

  constructor() {
    super();
    this.table = "webshrinkercategories";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  async createTable(){
    await db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` (`CATEGORY` VARCHAR(200) PRIMARY KEY, `CRITERIA` TEXT) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
    await this.populateTable();
    return this.loadRedis();
  }

  populateTable(){
    return db.promiseQuery("LOAD DATA LOCAL INFILE 'data/categories.csv' INTO TABLE `"+this.table+"` FIELDS TERMINATED BY ',' IGNORE 1 ROWS;");
  }

  /**
   * [get entry by category]
   * @param  {String} category
   * @return {Promise}
   */
  get(category){
    return db.promiseQuery("SELECT `CRITERIA` FROM `"+this.table+"` WHERE `CATEGORY` = '"+category+"'");
  }

  /**
   * [get all entries in table]
   * @return {Promise}
   */
  getAll(){
    return db.promiseQuery("SELECT * FROM `"+this.table+"`");
  }

  async loadRedis() {
    let client = Redis.createClient({db: 3});
    client.on("error", function (err) {
      console.log("Error " + err);
    });
    client.flushdb(); //clearing the controllist from redis on server installation
    let categories = await this.getAll();
    for (const record in categories){
      client.set(categories[record].CATEGORY, categories[record].CRITERIA);
    };
    client.quit();
  }
}//class