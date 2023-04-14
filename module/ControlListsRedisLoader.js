const redis = require('redis');
const ControlListsTableClass = require('./sql/ControlListsTableClass.js');
const WebshrinkerTableClass = require('./sql/WebshrinkerTableClass.js');
const WebshrinkerCategoryTableClass = require('./sql/WebshrinkerCategoryTableClass.js');

class RedisLoader {
  constructor() {
    this.controlListTable = new ControlListsTableClass;
    this.webShrinkerTable = new WebshrinkerTableClass;
    this.webShrinkerCategoryTable = new WebshrinkerCategoryTableClass;
  }



  /**
   * [checks if each redis db is empty and loads it from its correlated MySQL table if it is]
   */
  loadCL2RedisIfEmpty() {
    let client1 = redis.createClient({db: 1});
    client1.keys('*', async (err, keys) => {
      if (err) {
        console.error(err);
        client1.quit();
      } else if (keys.length === 0) {
        await this.controlListTable.loadRedis();
      } else {
        client1.quit();
      }
    });

    let client2 = redis.createClient({db: 2});
    client2.keys('*', async (err, keys) => {
      if (err) {
        console.error(err);
        client2.quit();
      } else if (keys.length === 0) {
        await this.webShrinkerTable.loadRedis();
      } else {
        client2.quit();
      }
    });

    let client3 = redis.createClient({db: 3});
    client3.keys('*', async (err, keys) => {
      if (err) {
        console.error(err);
        client3.quit();
      } else if (keys.length === 0) {
        await this.webShrinkerCategoryTable.loadRedis();
      } else {
        client3.quit();
      }
    });
  }

}

module.exports = new RedisLoader(); 