"use strict";
var settings = require('../module/Settings.js');
const ScheduleTableClass = require('./sql/ScheduleTableClass.js')

class Schedule extends ScheduleTableClass{

  /**
   * [create // create schedule-entry for project_id]
   * @param  {Integer} project_id
   * @return {Boolean}
   */
  create(project_id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.is(project_id)){
          reject(true)
        }else{
          await super.create(project_id);
          resolve(true)
        }
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [is check table for entry with PROJECT_ID]
   * @param  {Integer}  project_id
   * @return {Boolean}
   */
  is(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.is(project_id);
        resolve(rows.length>0 && rows[0].count>0 ? true: false)
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [fetch delivers settings of project-schedule]
   * @param  {Integer/Array} project_id
   * @return {Object} rows[0]
   */
  fetch(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let isNumber = false;
        if(typeof project_id === 'number'){
          isNumber = true;
          project_id = [project_id]
        }else if(Array.isArray(project_id) && project_id.length==0){
          resolve({});
        }
        let rows = await super.fetch(project_id);
        if(isNumber && rows.length>0){
          resolve(rows[0])
        }else{
          resolve(this.sortByColume('PROJECT_ID', rows))
        }
      } catch (e) {
        reject();
      }
    })
  }

  /**
   * [get check and return all settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Object} rows[0]
   */
  get(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await settings._checkPermission(user_id, project_id);
        let s = await settings.get(user_id, project_id);
        if(s.SCHEDULE === false){
          reject('Schedule is for this project not activated')
        }else if(await this.is(project_id)){
          this.fetch(project_id).then(resolve).catch(reject)
        }else{
          await this.create(project_id);
          this.get(user_id, project_id).then(resolve).catch(reject);
        }
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [set check and change settings for schedule]
   * @param {Integer} user_id
   * @param {Integer} project_id
   * @param {Object} options    [e.g. { START: 1, END: 2, SUN: false, MON..}, default: {}]
   * @return {Boolean}
   */
  set(user_id, project_id, options={}){
    return new Promise(async (resolve, reject)=>{
      try {
        await settings._checkPermission(user_id, project_id);
        if(this.is(project_id)){
          await super.set(project_id, options)
          resolve(true);
        }else
          reject(true);
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [remove delete entry for project]
   * @param {Integer} user_id
   * @param {Integer} project_id
   * @return {Boolean}
   */
  remove(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await settings._checkPermission(user_id, project_id);
        if(await this.is(project_id)){
          await super.remove(project_id);
          resolve(true)
        }else
          reject(true)
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


}

module.exports = new Schedule();
