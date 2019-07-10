"use strict";
var user = require('../module/users.js');
var User2ProjectTableClass = require('./sql/User2ProjectTableClass.js')

class User2Project extends User2ProjectTableClass{


  /**
   * [isAdmin return status of User-Permisson]
   * @param  {Integer}  user_id
   * @param  {Integer}  project_id
   * @return {Boolean}
   */
  isAdmin(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.isAdmin(user_id, project_id);
        resolve(rows.length>0? rows[0].ADMIN: false)
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [is // checks whether the user ID has already been entered in the table for the project]
   * @param  {Integer}  user_id
   * @param  {Integer/Array}  project_id
   * @return {Boolean}
   */
  is(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      let project_ids = []
      if(Array.isArray(project_id)){
        project_ids = project_id;
      }else{
        project_ids.push(project_id);
      }
      let rows = await super.is(user_id, project_ids);
      resolve(rows.length>0 && rows[0].count > 0? true: false);
    });
  }


}//class

module.exports = new User2Project();
