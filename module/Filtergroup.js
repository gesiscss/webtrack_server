"use strict";
var project = require('../module/Project.js');
var f2p = require('../module/Filtergroup2Project.js');
var u2p = require('../module/Users2Project.js');
var users = require('./users');
var FilterClass = require('../module/Filter.js');
let filter = new FilterClass();

var FiltergroupTableClass = require('./sql/FiltergroupTableClass.js')

class Filtergroup extends FiltergroupTableClass{

  constructor(props) {
    super(props);
  }

  /**
   * [_checkPermission check user-id has permisson to project/'s]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {Boolean}
   */
  _checkPermission(user_id, id){
    return new Promise(async (resolve, reject)=>{
      try {
        let b = await this.isId(id);
        if(b){
          let project_ids = await f2p.getProjectIDtoGroupId(id);
          let b = await u2p.is(user_id, project_ids);
          if(b || await users.isAdmin(user_id)){
            resolve(true);
          }else{
            reject('No Permisson')
          }
        }else
          reject('Group-ID not found');
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [add check and add new filtergroup to project-id]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {String} name
   * @return {Object}
   */
  add(user_id, project_id, name){
    return new Promise(async (resolve, reject)=>{
      try {
        await project._checkPermission(user_id, project_id);
        let b = await this.isName(name);
        if(b)
          reject('Name already exist');
        else{
          let id = (await super.add(name)).insertId;
          await f2p.add(id, project_id);
          resolve({id: id})
        }
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [change check and change name of group]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @param  {String} name
   * @return {Boolean}
   */
  change(user_id, id, name){
    return new Promise((resolve, reject)=>{
      this._checkPermission(user_id, id).then(b => {
          super.change(id, name).then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  /**
   * [remove check and remove group]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {Boolean}
   */
  remove(user_id, id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, id);
        await f2p.removeGroup(id);
        let rows = await super.remove(id);
        resolve(rows);
      } catch (e) {
        reject(e)
      }
    });
  }




  /**
   * [getAll get all groups with filter and there settings]
   * @param  {Integer} user_id
   * @return {Array}
   */
  getAll(user_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.getAll(user_id);
        let r = rows.map(e => e.ID);
        if(r.length===0){
          resolve([]);
        }else{
          for (let g of rows) g.FILTER = [];
          let list = await filter.getAllFilter(r);
          for (let e of list) {
              let g = rows[r.indexOf(e.GROUP_ID)];
              try {
                  e.VALUE = JSON.parse(e.VALUE);
              } catch (e) {}
              g.FILTER.push(e);
          }
          resolve(rows);
        }
      } catch (e) {
        reject(e)
      }
    });
  }

}//class

module.exports = new Filtergroup();
