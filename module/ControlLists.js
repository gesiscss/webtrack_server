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

  /**
   * [gets a domain and returns its flag: full_deny, full_allow, only_domain, only_url]
   * @param  {Object} request
   * @return {Promise}
   */
  queryURL(request) {
    return new Promise(async (resolve, reject) => {
      try {
        var result;
        //checks if the url contains 'www' and removes it if it does
        let url = request.body.domain;
        if (url.startsWith('www.')){
          var domain = url.slice(4);
        } else {
          var domain = url;
        }
        //first check is in the redis control list database (which is populated from the csv file)
        this.redisClientControlList.get(domain, async (err, value) => {
          if (value !== null) {
            result = value;
            console.log('found in Control-List');
            console.log('result:', result);
            resolve(result);
          } else {
            //second check is in the redis webshrinker cache database 
            this.redisClientWebShrinker.hvals(domain, async (err, value) => {
              if (value.length !== 0 && new Date() - new Date(Date.parse(value[1])) < this.cacheExpiration) {   //check if domain is in cache table AND if record is not older than 90 days
                console.log('found in WebShrinker cache table');
                let response = value[0];
                let category = JSON.parse(response).data[0].categories[0].label;
                console.log('Category: ', category);
                //if found in webshrinker cache db we check the rule for the category in the categories db
                result = await this.queryCategory(category);
                console.log('result:', result);
                resolve(result);
              } else {
                //if not found in the control list db or the webshrinker cache we query the webshrinker API
                console.log('Querying Webshrinker Service');
                let WSresult = await WebshrinkerWrapper.queryWebshrinker(domain);
                await this.webShrinkerTable.insert_or_update(domain, JSON.stringify(WSresult)); //adding the response to the cache table
                let rows = await this.webShrinkerTable.get(domain);
                this.redisClientWebShrinker.hmset(domain, {'response': rows[0].RESPONSE, 'timestamp': rows[0].TIMESTAMP});  //adding the response to the redis db. taking it from mysql to ensure the timestamp is identical
                this.webShrinkerLogTable.insert(domain, JSON.stringify(WSresult)); //adding the response to the log table
                //querying the category from the response in the category rules table
                this.redisClientWebShrinker.hvals(domain, async (err, value) => {
                  let category = JSON.parse(value[0]).data[0].categories[0].label;
                  console.log('Category from WS: ', category)
                  result = await this.queryCategory(category);
                  console.log('result:', result);
                  resolve(result);
                });
              }
            });
          }
        });
      } catch (e) {
        console.error(e);
        reject(e)
      }
    });
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