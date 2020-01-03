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
        let project_conf = await this.getProjectConfiguration(project_id, client_hash);
        if(project_conf.CHECK_CLIENTIDS){
          let client_id = await client.getClientID(client_hash.trim());
          if(await client.isClient2Project(client_id, project_conf.ID)){
            log.msg('Accepted Client HASH: ' + client_hash);
            resolve(true);
          }else{
            if(await client.is(client_hash)){
              log.msg('Client HASH (' + client_hash + ') exists in the database,' + 
                + ' but not assigned to the project (' + project_id + ')' )
            }
            log.msg('Client HASH does not exist: ' + client_hash);
            resolve(false);
          }
        } else{
          reject('NotImplementedError: Uploading without checking client ID is not implemented (Project ID: ' + project_conf.ID + ')')
        }

      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [checkClientId2Project check the client_hash has permisson to the project]
   * @param  {Integer} project_id
   * @return {Promise} project settings
   */
  getProjectConfiguration(project_id, client_hash){
    return new Promise(async (resolve, reject) => {
      try {
        let conf = await settings.fetchOne(project_id);
        if (conf.ACTIVE){
          resolve(conf);
        }else{
          reject('Project-ID ' + project_id + ' not active. Client HASH: ' + client_hash);
        }
      } catch (e) {
        reject('Unable to fetch Project-ID ' + project_id + ' during attempt from client HASH ' + client_hash + '.' +  e)
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
  _checkUpload(project_conf, client_hash, pages, versionType){
    return new Promise(async (resolve, reject) => {
      try {
        if(project_conf.CHECK_CLIENTIDS){
          let client_id = await client.getClientID(client_hash.trim());
          if(await client.isClient2Project(client_id, project_conf.ID)){
            await inspector.validatePage(pages)
            resolve(client_id);
          }else{
            reject('Client-HASH ' + client_hash + ' not allow for the project ID: ' + project_conf.ID);
          }
        } else{
          reject('NotImplementedError: Uploading without checking client ID is not implemented (Project ID: ' + project_conf.ID + ')')
        }
      } catch (err) {
        reject('Error during Client-HASH request: ', client_hash, ' Error:', err)
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
        let project_conf = await this.getProjectConfiguration(project_id, client_hash);
        let client_id = await this._checkUpload(project_conf, client_hash, pages, versionType);

        let subprocess = new SubProcess();
        if(wait){
          await subprocess.saveUpload({project_id: project_id, client_id: client_id, client_hash: client_hash, pages: pages, versionType: versionType});
        }else{
          // console.log('DISABLE Upload');
          subprocess.saveUpload({project_id: project_id, client_id: client_id, client_hash: client_hash, pages: pages, versionType: versionType}).catch(error => {
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
