"use strict";
var Filtergroup2ProjectTableClass = require('./sql/Filtergroup2ProjectTableClass.js')

class Filtergroup2Project extends Filtergroup2ProjectTableClass{

  /**
   * [getProjectIDtoGroupId return all project_ids where group_id found]
   * @param  {Integer} group_id
   * @return {Array}
   */
  getProjectIDtoGroupId(group_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.getProjectIDtoGroupId(group_id);
        resolve(rows.map(e => e.PROJECT_ID))
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [is check is group-id coupled with project-id]
   * @param  {Integer}  group_id
   * @param  {Integer}  project_id
   * @return {Boolean}
   */
  is(group_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.is(group_id, project_id);
        resolve(row.length>0 && rows[0].count > 0? true: false)
      } catch (e) {
        reject(e)
      }
    });
  }


}//class

module.exports = new Filtergroup2Project();
