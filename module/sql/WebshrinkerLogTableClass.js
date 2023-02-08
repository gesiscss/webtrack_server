const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class WebshrinkerLogTableClass extends Core{

  constructor() {
    super();
    this.table = "webshrinkerlog";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` (`DOMAIN` VARCHAR(200), `RESPONSE` JSON, `TIMESTAMP` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [get entry by url]
   * @param  {String} url
   * @return {Promise}
   */
  get(domain){
    return db.promiseQuery("SELECT `RESPONSE`, `TIMESTAMP` FROM `"+this.table+"` WHERE domain = '"+domain+"'");
  }

  /**
   * [insert response]
   * @param {String} domain
   * @param {String} response
   * @return {Promise}
   */
  insert(domain, response){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`DOMAIN`, `RESPONSE`) VALUES ('"+domain+"', '"+response+"')");
  }

  /**
   * [get all entries in table]
   * @return {Promise}
   */
  getAll(){
    return db.promiseQuery("SELECT * FROM `"+this.table+"`");
  }
}
