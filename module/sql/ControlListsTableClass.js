const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class ControlListsTableClass extends Core{

  constructor() {
    super();
    this.table = "controllists";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  async createTable(){
    await db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` (clean_domain VARCHAR(40) PRIMARY KEY, criteria TEXT) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
    return this.populateTable();
  }

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


}//class
