"use strict";
var FilterTableClass = require('./sql/FilterTableClass.js');


class Filter extends FilterTableClass{

  constructor(filtergroup=null) {
    super();
    this.filtergroup = filtergroup

  }


  /**
   * [add // add filter to group with Settings]
   * @param {Integer} user_id
   * @param {Integer} group_id
   * @param {String} name
   * @param {String} colume   [e.g. 'URL', 'TITLE', 'Content']
   * @param {String} type     [e.g. 'string', 'number', 'date']
   * @param {String} value
   */
  add(user_id, group_id, name, colume, type, value){
    return new Promise(async (resolve, reject)=>{
      try {
        await this.filtergroup._checkPermission(user_id, group_id);
        let rows = await super.add(group_id, name, colume, type, value);
        resolve(rows.insertId)
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [change // change Filtersettings]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @param  {String} name
   * @param  {String} colume  [e.g. 'URL', 'TITLE', 'Content']
   * @param  {String} type    [e.g. 'string', 'number', 'date']
   * @param  {String} value
   * @return {Boolean}
   */
  change(user_id, id, name, colume, type, value){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, id);
        await super.change(id, name, colume, type, value);
        resolve(true);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [is check is group coupled with project-id]
   * @param  {Integer}  group_id
   * @param  {Integer}  project_id
   * @return {Boolean}
   */
  is(group_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await super.is(group_id, project_id);
        resolve(rows.length>0 && rows[0].count > 0? true: false)
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [_checkPermission checked permisson of filter]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {Boolean}
   */
  _checkPermission(user_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        let b = await this.isId(id);
        if(b){
          let filter = await this.get(id);
          this.filtergroup._checkPermission(user_id, filter.GROUP_ID).then(resolve).catch(reject);
        }else
          reject('Filter-ID not found');
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [removeGroup delete all filter coupled with group-id]
   * @param  {Integer} user_id
   * @param  {Integer} group_id
   * @return {Boolean}
   */
  removeGroup(user_id, group_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this.filtergroup._checkPermission(user_id, group_id);
        await super.removeGroup(group_id);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * [remove // remove filter]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {Boolean}
   */
  remove(user_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, id);
        await super.remove(id);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * [get return filter Settings]
   * @param  {Integer} id
   * @return {Object}
   */
  get(id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await super.get(id);
        if(rows.length==0)
          resolve(false)
        else
         resolve(rows[0]);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getAll deliver content of filters by ids]
   * @param  {Array} ids
   * @return {Array}
   */
  getAll(ids=[]){
    return new Promise(async (resolve, reject) => {
      try {
        if(ids.length==0){
          resolve([])
        }else{
          let rows = await super.getAll(ids);
          if(rows.length==0)
            resolve([])
          else
           resolve(rows);
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [_getAll return all filter with particular group]
   * @param  {Integer/Array} group_id
   * @return {Array}
   */
  getAllFilter(group_id){
    return new Promise((resolve, reject) => {
      if(!Array.isArray(group_id)) group_id = [group_id];
      super.getAllFilter(group_id).then(resolve).catch(reject);
    });
  }

}//class

module.exports = Filter;
