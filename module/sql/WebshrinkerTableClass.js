const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');
const Redis = require('redis');

module.exports = class WebshrinkerTableClass extends Core{

  constructor() {
    super();
    this.table = "webshrinker";
    this.redisClientCategories = Redis.createClient({db: 3});
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



  /**
   * [checks the rule for the requested category in the categories db]
   * @param  {String} category
   * @return {Promise}
   */
  async queryCategory(category) {
    return new Promise((resolve, reject) => {
      this.redisClientCategories.get(category, async (err, value) => {
        if (err) {
          reject(err);
        } else if (value !== null) {
          resolve(value);
        } else {
          resolve('full_allow');  //if the category wasn't found in the table, return full_allow
        }
      });
    });
  }

  /**
   * [load the table into redis db. stores the domains category from the response and the criteria from the categories table]
   * @return {Promise}
   */
  async loadRedis() {
    const client = Redis.createClient({db: 2});
    client.on("error", function (err) {
      console.log("Error " + err);
    });
    const webshrinkercache = await this.getAll();
    for (const recordnum in webshrinkercache){
      let record = webshrinkercache[recordnum];
      let domain = record.DOMAIN;
      let timestamp = record.TIMESTAMP;
      let response = JSON.parse(webshrinkercache[recordnum].RESPONSE);
      await this.restrictiveCriteria(client, response, domain, timestamp);
    };
    client.quit();
  }

  /**
   * [finds the most restrictive category in a webshrinker response and adds a record to redis db]
   * @param  {Object} client
   * @param  {Object} response
   * @param  {String} domain
   * @param  {Onject} timestamp
   * @return {String} 
   */
  async restrictiveCriteria(client, response, domain, timestamp) {
    let categoriesObj = {};
    let criteria = '';
    let category = '';
    for (const WScategoryObj of response['data'][0]['categories']) {
      let label = WScategoryObj['label'];
      categoriesObj[label] = await this.queryCategory(label);
    }
    const values = Object.values(categoriesObj);
    if (values.includes('full_deny')) {
      category = Object.entries(categoriesObj).find(([key, value]) => value === 'full_deny')[0];
      criteria = 'full_deny';
    } else if (values.includes('only_domain')) {
      category = Object.entries(categoriesObj).find(([key, value]) => value === 'only_domain')[0];
      criteria = 'only_domain';
    } else if (values.includes('only_url')) {
      category = Object.entries(categoriesObj).find(([key, value]) => value === 'only_url')[0];
      criteria = 'only_url';
    } else {
      category = Object.entries(categoriesObj).find(([key, value]) => value === 'full_allow')[0];
      criteria = 'full_allow';
    }
    client.hmset(domain, 'CATEGORY', category, 'TIMESTAMP', timestamp, 'CRITERIA', criteria);
    return criteria;
  }
}
