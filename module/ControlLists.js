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
    this.redisClient = Redis.createClient({db: 1});
  }

  /**
   * [gets a domain and returns its flag: full_deny, full_allow, only_domain, only_url]
   * @param  {Object} request
   * @return {Promise}
   */
  queryURL(request) {
    return new Promise(async (resolve, reject) => {
      try {
        //checks if the url contains 'www' and removes it if it does
        let url = request.body.domain;
        if (url.startsWith('www.')){
          var domain = url.slice(4);
        } else {
          var domain = url;
        }
        //first check is in the control list table (which is populated from the csv file)
        this.redisClient.get(domain, async (err, value) => {
          if (value !== null) {
            var result = value;
            console.log('found in Control-List');
          } else {
            //second check is in the webshrinker cache table 
            let rows = await this.webShrinkerTable.get(domain);
            if (rows.length && new Date() - rows[0].TIMESTAMP < this.cacheExpiration) {   //check if domain is in cache table AND if record is not older than 90 days
              console.log('found in WebShrinker cache table');
              let response = JSON.parse(rows[0].RESPONSE);
              let category = response.data[0].categories[0].label;
              console.log('Category: ', category);
              //if found in webshrinker cache table we check the rule for the category in the categories table
              var result = await this.queryCategory(category);
            } else {
              //if not found in the control list table or the webshrinker cache we query the webshrinker API
              console.log('Querying Webshrinker Service');
              let WSresult = await WebshrinkerWrapper.queryWebshrinker(domain);
              this.webShrinkerTable.insert_or_update(domain, JSON.stringify(WSresult)); //adding the response to the cache table
              this.webShrinkerLogTable.insert(domain, JSON.stringify(WSresult)); //adding the response to the log table
              let category = WSresult.data[0].categories[0].label
              console.log('Category from WS: ', category);
              //querying the category from the response in the category rules table
              var result = await this.queryCategory(category);
            }
          }
          console.log('result:', result);
          resolve(result);
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
    let rows = await this.webShrinkerCategoryTable.get(category);
    if (rows.length) {
      var result = rows[0].CRITERIA;
    } else {
      var result = 'full_allow';   //if the category wasn't found in the table, return full_allow
    }
    return result;
  }

};

module.exports = new ControlLists();
