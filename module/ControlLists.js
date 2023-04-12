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
   * [queries a domain in controllist redis db. get returns the value for the key]
   * @param  {Object} client
   * @param  {String} domain
   * @return {Promise}
   */
  get(client, domain) {
    return new Promise(async (resolve, reject) => {
      client.get(domain, async(err, value) => {
        resolve(value);
      });
    });
  }

  /**
   * [queries a domain in webshrinker cache redis db. hvals returns all the values for the key]
   * @param  {Object} client
   * @param  {String} domain
   * @return {Promise}
   */
  hvals(client, domain) {
    return new Promise(async (resolve, reject) => {
      client.hvals(domain, async (err, value) => {
        resolve(value);
      });
    });
  }

  /**
   * [removes the url subdomain e.g. www]
   * @param  {String} url
   * @return {String}
   */
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
          return result;
        } else {
          //second check is in the redis webshrinker cache database 
          const WScacheResult = await this.hvals(this.redisClientWebShrinker, domain);
          if (WScacheResult.length !== 0 && new Date() - new Date(Date.parse(WScacheResult[1])) < this.cacheExpiration) {   //check if domain is in cache table AND if record is not older than 90 days
            result = WScacheResult[2];
            return result;
          } else {
            //if not found in the control list db or the webshrinker cache we query the webshrinker API
            let WSresult = await WebshrinkerWrapper.queryWebshrinker(domain);
            if (WSresult !== undefined) {
              let response_string = JSON.stringify(WSresult);
              this.webShrinkerTable.insert_or_update(domain, response_string); //adding the response to the cache table
              this.webShrinkerLogTable.insert(domain, response_string); //adding the response to the log table
              result = await this.webShrinkerTable.restrictiveCriteria(this.redisClientWebShrinker, WSresult, domain, new Date());
              return result;
            } else {
              if (WScacheResult.length !== 0) {
                result = WScacheResult[2];
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

}

module.exports = new ControlLists();