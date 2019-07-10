"use strict";
var StorageDestination2ProjectTableClass = require('./sql/StorageDestination2ProjectTableClass.js')

class StorageDestination2Project extends StorageDestination2ProjectTableClass{

  /**
   * [get return the storage destination and id]
   * @param  {Integer} project_id
   * @return {Promise} Array [DESTINATION, ID]
   */
  get(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.get(project_id);
        if(rows.length===0){
          reject('No storage config found');
        }else{
          resolve([rows[0].DESTINATION, rows[0].ID])
        }
      } catch (e) {
        reject(e)
      }
    });
  }

}//class

module.exports = new StorageDestination2Project();
