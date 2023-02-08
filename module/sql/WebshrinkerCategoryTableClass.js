const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

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
    return this.populateTable();
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
}//class