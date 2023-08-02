"use strict";
var project = require('../module/Project');

var ProjektSettingsTableClass = require('./sql/ProjektSettingsTableClass.js')


class Settings extends ProjektSettingsTableClass{

  /**
   * [is checks settings-id exist]
   * @param  {String}  id
   * @return {Boolean}
   */
  is(id){
    return new Promise((resolve, reject)=>{
      if(this.COLUMN.indexOf(id)<0){
        reject('Settings-ID not allowed');
      }else{
        resolve(true);
      }
    });
  }

  /**
   * [_checkPermission check Permisson]
   * @param  {Integer} user_id    [description]
   * @param  {Integer} project_id [description]
   * @return {Boolean}            [description]
   */
  _checkPermission(user_id, project_id){
    return new Promise((resolve, reject)=>{
      project._checkPermission(user_id, project_id).then(resolve).catch(reject)
    });
  }

  /**
   * [fetch return all entrys]
   * @param  {Array/Integer} project_id
   * @return {Object}
   */
  fetch(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let isNumber = false;
        if(typeof project_id === 'number'){
          isNumber = true;
          project_id = [project_id]
        }
        let rows = await super.fetch(project_id)
        if(isNumber){
          delete rows[0].ID;
          resolve(rows[0])
        }else{
          resolve(this.sortByColume('ID', rows))
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [fetch return all entrys]
   * @param  {Array/Integer} project_id
   * @return {Object}
   */
  fetchOne(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.fetchOne(project_id)
        resolve(rows[0])
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [get check Permisson and return all settings]
   * @param  {Integer} user_id    [description]
   * @param  {Integer} project_id [description]
   * @return {Object}            [description]
   */
  get(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        resolve(await this.fetch(project_id))
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [_setBoolean change boolean value of setting]
   * @param {Integer} project_id
   * @param {String} id
   * @param {boolean} boolean
   */
  _setBoolean(project_id, id, boolean){
    return new Promise((resolve, reject)=>{
      boolean = boolean? 1 : 0;
      this.set(project_id, id, boolean).then(resolve).catch(reject);
    });
  }


  /**
   * [change check and change value of settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @param  {Boolean} boolean
   * @return {Boolean}
   */
  changeBoolean(user_id, project_id, id, boolean){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        await this.is(id);
        this._setBoolean(project_id, id, boolean).then(resolve).catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [changeValue change values of settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @param  {Unkown} value [default: '']
   * @return {Boolean}
   */
  changeValue(user_id, project_id, id, value=''){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        await this.is(id);
        if(typeof value==='object') value = JSON.stringify(value);
        this.set(project_id, id, value).then(resolve).catch(reject);
      } catch (e) {
        reject(e)
      }
    })
  }



}//class

module.exports = new Settings();
