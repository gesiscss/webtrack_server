"use strict";
var project = require('../module/Project.js');
var Cache = require('../module/lib/Cache.js');

var UrllistTableClass = require('./sql/UrllistTableClass.js')

class Urllist extends UrllistTableClass{

  constructor(props) {
    super(props);
    this.cache = new Cache();
  }

  /**
   * [_getListforProject return all urllist-URL's for Project]
   * @param  {Integer} project_id
   * @return {Array/Object}
   */
  _getListforProject(project_id){
    return new Promise((resolve, reject)=>{
      let isNumber = false;
      if(typeof project_id === 'number'){
        isNumber = true;
        project_id = [project_id]
      }
      this.cache.action(
        '_getListforProject', () => new Promise(async (cacheResolve, cacheReject) => {
          try {
            let rows = await super._getListforProject(project_id);
            let result = {};
            for (let p of project_id) result[p] = [];
            for (let r of rows) result[r.PROJECT_ID].push(r.URL.replace(/\s/g, ''));
            cacheResolve(result);
          } catch (e) {
            cacheReject(e)
          }
        })
      ).then(resolve).catch(reject);
    });
  }

  /**
   * [_checkPermission check user-id-permisson to project-id]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Boolean}
   */
  _checkPermission(user_id, project_id){
    return new Promise((resolve, reject)=>{
      project._checkPermission(user_id, project_id).then(resolve).catch(reject)
    });
  }

  /**
   * [get description]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array}   range
   * @param  {Object}  sorted
   * @param  {Object}  filtered
   * @return {Array}
   */
  get(user_id, project_id, range, sorted, filtered){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        resolve(await super.get(project_id, range, sorted, filtered));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [add //checks and create new backlist coupled with project]
   * @param {Integer} user_id
   * @param {Integer} project_id
   * @param {Array} urls
   * @return {Integer}            [last intertid]
   */
  add(user_id, project_id, urls){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        this.cache.delete();
        let values = [];
        for (let u of urls) {
          let url = u.replace(/\s/g, '');
          if (url != ''){
            values.push([project_id, url]);
          }
        }
        let rows = await super.add(project_id, values);
        resolve(rows);
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [change check and change URL]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @param  {String} url
   * @return {Boolean}
   */
  change(user_id, project_id, id, url){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        if(await this.isId(id)){
          this.cache.delete();
          console.log(id, url);
          resolve(await super.change(id, url));
        }else{
          reject('URL-ID not found');
        }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }


  /**
   * [getCount return number of URL's]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Integer}
   */
  getCount(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        let rows = await super.getCount(project_id);
        resolve(rows.length>0 && rows[0].count > 0? rows[0].count: false);
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [delete check and delete entry]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @return {Boolean}
   */
  delete(user_id, project_id, id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        if(await this.isId(id)){
          this.cache.delete();
          resolve(await super.delete(id))
        }else{
          reject('List-ID not found');
        }
      } catch (e) {
          console.log(e);
          reject(e);
      }
    });
  }

  /**
   * [clean check and delete all urls coupled project-id]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Boolean}
   */
  clean(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        this.cache.delete();
        resolve(await super.clean(project_id));
      } catch (e) {
        reject(e)
      }
    })
  }


}//class

module.exports = new Urllist();
