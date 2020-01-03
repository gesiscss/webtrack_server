"use strict";
const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


module.exports = class Client2ProjectTableClass extends Core{

  constructor() {
    super();
    this.table = "client2project";
  }

  /**
   * [install Create client2project-table]
   * @return {Boolean}
   */
  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `CLIENT_ID` INT(255) NOT NULL , `PROJECT_ID` INT(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }


  /**
   * [getList delivers all user_ids combines with project_id]
   * @param  {Integer} project_id
   * @return {Promise} Array [Ids of clients]
   */
  getList(project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery("SELECT `CLIENT_ID` FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
        resolve(rows.map(v=>v.CLIENT_ID))
      } catch (err) {
        reject(err)
      }
    })
  }


  /**
   * [getCombinesClient2Project return all project_id that are in connection to the client_id]
   * @param  {Integer} client_id
   * @return {Promise} Array
   */
  getCombinesClient2Project(client_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery("SELECT `PROJECT_ID` FROM `"+this.table+"` WHERE `CLIENT_ID` = "+client_id);
        resolve(rows.map(v=>v.PROJECT_ID))
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * [isClient2Project check if the client has been assigned to the respective project]
   * @return {Promise} Integer
   */  
   isClient2Project(client_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery("SELECT 1 FROM `"+this.table+"` WHERE `CLIENT_ID` = " + client_id + " AND `PROJECT_ID` = " + project_id);
        resolve(rows.length>0? true: false)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * [getCountOfClientData return a number of quanitiy of data the client has]
   * @return {Promise} Integer
   */
  getCountOfClientData(client_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery("SELECT count(`CLIENT_ID`) as count FROM `page` WHERE `CLIENT_ID` = "+client_id);
        resolve(rows[0].count)
      } catch (err) {
        reject(err)
      }
    })
  }


  /**
   * [delete // delete client - project combines]
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Promise}
   */
  delete(project_id, client_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `CLIENT_ID` = "+client_id+" AND `PROJECT_ID` = "+project_id);
        resolve(true)
      } catch (err) {
        reject(err)
      }
    })
  }


  /**
   * [add combines client_id with project_id]
   * @param {Integer} project_id
   * @param {Integer} client_id
   * @return {Promise}
   */
  add(project_id, client_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await db.promiseQuery("INSERT INTO `"+this.table+"` (`PROJECT_ID`, `CLIENT_ID`) VALUES ?", [[[project_id, client_id]]]);
        resolve(true);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [removeProject description]
   * @param  {Integer} project_id [description]
   * @return {Promise}
   */
  removeProject(project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `PROJECT_ID` = "+project_id);
        resolve(true)
      } catch (err) {
        reject(err)
      }
    })
  }



}//class
