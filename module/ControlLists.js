"use strict";
const WebshrinkerCategoryTableClass = require('./sql/WebshrinkerCategoryTableClass.js');
const WebshrinkerTableClass = require('./sql/WebshrinkerTableClass.js');
const WebshrinkerLogTableClass = require('./sql/WebshrinkerLogTableClass.js');
const ControlListsTableClass = require('./sql/ControlListsTableClass.js');
const WebshrinkerWrapper = require('./lib/WebshrinkerWrapper.js');
const Redis = require('redis');

class ControlLists {

  constructor() {
    this.controlListTable = new ControlListsTableClass;
    this.webShrinkerTable = new WebshrinkerTableClass;
    this.webShrinkerCategoryTable = new WebshrinkerCategoryTableClass;
    this.webShrinkerLogTable = new WebshrinkerLogTableClass;
    this.cacheExpiration = 90 * 24 * 60 * 60 * 1000;
    this.redisClientControlList = Redis.createClient({db: 1});
    this.redisClientWebShrinker = Redis.createClient({db: 2});
    this.redisClientCategories = Redis.createClient({db: 3});
  }

  get(client, domain) {
    return new Promise(async (resolve, reject) => {
      client.get(domain, async(err, value) => {
        resolve(value);
      });
    });
  }

  hvals(client, domain) {
    return new Promise(async (resolve, reject) => {
      client.hvals(domain, async (err, value) => {
        resolve(value);
      });
    });
  }

  remove_suffix(url) {
    if (url.startsWith('www.')) {
      return url.slice(4);
    } else {
      return url
    }
  }

  /**
   * [gets a domain and returns its flag: full_deny, full_allow, only_domain, only_url]
   * @param  {Object} request
   * @return {Promise}
   */
  async queryURL(request) {
      try {
        var result;
        //checks if the url contains 'www' and removes it if it does
        let url = request.body.domain;
        var domain = this.remove_suffix(url);
        //first check is in the redis control list database (which is populated from the csv file)
        const CLresult = await this.get(this.redisClientControlList, domain);
        if (CLresult !== null) {
          result = CLresult;
          console.log('found in Control-List');
          console.log('result:', result);
          return result;
        } else {
          //second check is in the redis webshrinker cache database 
          const WScacheResult = await this.hvals(this.redisClientWebShrinker, domain);
          if (WScacheResult.length !== 0 && new Date() - new Date(Date.parse(WScacheResult[1])) < this.cacheExpiration) {   //check if domain is in cache table AND if record is not older than 90 days
            console.log('found in WebShrinker cache table');
            let category = WScacheResult[0];
            console.log('Category: ', category);
            //if found in webshrinker cache db we check the rule for the category in the categories db
            result = await this.queryCategory(category);
            console.log('result:', result);
            return result;
          } else {
            //if not found in the control list db or the webshrinker cache we query the webshrinker API
            console.log('Querying Webshrinker Service');
            let WSresult = await WebshrinkerWrapper.queryWebshrinker(domain);
            console.log(WSresult.data[0]);
            if (WSresult !== undefined) {
              let response_string = JSON.stringify(WSresult);
              this.webShrinkerTable.insert_or_update(domain, response_string); //adding the response to the cache table
              this.webShrinkerLogTable.insert(domain, response_string); //adding the response to the log table
              let category = WSresult.data[0].categories[0].label;
              this.redisClientWebShrinker.hmset(domain, {'CATEGORY': category, 'TIMESTAMP': new Date()}); //adding the category to the redis db. note that timestamp may differ slightly between the mySQL DB and the Redis DB
              //querying the category from the response in the category rules table
              console.log('Category from WS: ', category)
              result = await this.queryCategory(category);
              console.log('result:', result);
              return result;
            } else {
              console.log('Webshrinker Error');
              if (WScacheResult.length !== 0) {
                let category = WScacheResult[0];
                result = await this.queryCategory(category);
                return result;
              } else {
                return 'full_deny'; //if can't get an answer from webshrinker resolve to full_deny
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
        reject(e)
      }
  }

  /**
   * [checks the rule for the requested category in the categories table]
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

}

module.exports = new ControlLists();