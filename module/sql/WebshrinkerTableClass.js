const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');
const Redis = require('redis');

module.exports = class WebshrinkerTableClass extends Core{

  constructor() {
    super();
    this.table = "webshrinker";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` (`DOMAIN` VARCHAR(200) PRIMARY KEY, `RESPONSE` JSON, `TIMESTAMP` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
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
  insert_or_update(domain, response){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`DOMAIN`, `RESPONSE`) VALUES ('"+domain+"', '"+response+"') ON DUPLICATE KEY UPDATE RESPONSE='"+response+"', TIMESTAMP=now()");
  }

  /**
   * [get all entries in table]
   * @return {Promise}
   */
  getAll(){
    return db.promiseQuery("SELECT * FROM `"+this.table+"`");
  }

  async loadRedis() {
    let client = Redis.createClient({db: 2});
    client.on("error", function (err) {
      console.log("Error " + err);
    });
    let webshrinkercache = await this.getAll();
    for (const record in webshrinkercache){
      let response = JSON.parse(webshrinkercache[record].RESPONSE);
      let category = response['data'][0]['categories'][0]['label'];
      client.hmset(webshrinkercache[record].DOMAIN, 'CATEGORY', category, 'TIMESTAMP', webshrinkercache[record].TIMESTAMP);
    };
    client.quit();
  }
}
