"use strict";
const Page = require('./Page.js');
const SubProcess = require('./lib/SubProcess.js');
const client = require('./Client.js').client;
const settings = require('./Settings.js');
const project = require('./Project.js');
const moment = require('moment');
const log = require('./lib/log');
const Inspector = require('./lib/Inspector');
const inspector = new Inspector();

class TrackingPage extends Page{

  /**
   * [checkClientId2Project check the client_hash has permisson to the project]
   * @param  {String} client_hash
   * @param  {Integer} project_id
   * @return {Promise} Boolean
   */
  checkClientId2Project(client_hash, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await project.isId(project_id)){
          if((await settings.fetch(project_id)).CHECK_CLIENTIDS){
            client_hash = client_hash.trim();
            if((await client.getHashCombies2Project(project_id)).includes(client_hash)){
              log.msg('Accepted Client-ID: ' + client_hash);
              resolve(true);
            }else{
              if(await client.is(client_hash)){
                log.msg('Client-ID (' + client_hash + ') exists in the database,' + 
                  + ' but not assigned to the project (' + project_id + ')' )
              }
              log.msg('Rejected Client-ID: ' + client_hash);
              resolve(false);
            }
          }else{
            resolve(true);
          }
        }else{
          reject('Project-ID not found');
        }
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [_checkUpload
   * - check the permisson of project-id and client_hash
   * - validate the pages
   * ]
   * @param  {Integer} project_id
   * @param  {String} client_hash
   * @param  {Array} pages
   * @param  {String} versionType
   * @return {Promise}
   */
  _checkUpload(project_id, client_hash, pages, versionType){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.checkClientId2Project(client_hash, project_id)){
          await inspector.validatePage(pages)
          resolve();
        }else{
          reject('Client-ID '+client_hash+' not allow to the project '+project_id);
        }
      } catch (err) {
        reject(err)
      }
    });
  }


  /**
   * [create Save from client-hash the page-content to the project
   * if the parameter wait is true, then the promise wait for the subprocess
   * ]
   * @param  {String} client_hash
   * @param  {Array} pages
   * @param  {String} versionType [e.g. 'Chrome' || 'yx']
   * @param  {Integer} project_id
   * @param  {Boolean} wait
   * @return {Boolean}
   */
  create(project_id, client_hash, pages, versionType, wait=false){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkUpload(project_id, client_hash, pages, versionType);
        let subprocess = new SubProcess();
        if(wait){
          await subprocess.saveUpload({project_id: project_id, client_hash: client_hash, pages: pages, versionType: versionType});
        }else{
          // console.log('DISABLE Upload');
          subprocess.saveUpload({project_id: project_id, client_hash: client_hash, pages: pages, versionType: versionType}).catch(error => {
            log.error(error);
          })
        }
        resolve();
      } catch (err) {
        reject(err);
      }
      //
    });
  }//()

}//class


module.exports = new TrackingPage();
