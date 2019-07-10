"use strict";

// var filtergroup = require('../module/Filtergroup.js');
// var filter = new (require('../module/Filter.js'))(filtergroup);

const Page = require('../module/Page.js');
const page = new Page();
var users = require('../module/users.js');
var client = require('../module/Client.js').client;
var dataPage = require('../module/DataPage.js');
var u2p = require('../module/Users2Project.js');
var events2page = require('../module/Events2Page.js');

var ProjektTableClass = require('./sql/ProjektTableClass.js')

class Projekt extends ProjektTableClass{

  /**
   * [add create new project]
   * @param {Integer} user_id
   * @param {String} name
   * @param {String} description
   */
  add(user_id, name, description){
    return new Promise(async (resolve, reject) => {
      try {
        let isId = await users.isId(user_id);
        if(!isId) throw Error('No Permisson');

        let isName = await this.isName(name);
        if(isName) throw Error('Name already exist');

        let id = (await super.add(name, description)).insertId;
        await u2p.add(user_id, id, 1);
        resolve({id: id});
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [change check and change name and description from project entry]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @param  {String} name
   * @param  {String} description
   * @return {Promise} Boolean
   */
  change(user_id, id, name, description){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(id)){
          if(await u2p.isAdmin(user_id, id)){
            await super.change(id, name, description);
            resolve(true)
          }else
            reject('No Permisson');
        }else
          reject('Projekt-ID not found');
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [delete Checked id permisson and delete project]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {boolean}
   */
  delete(user_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        let b = await this.isId(id);
        if(b){
          b = await u2p.isAdmin(user_id, id)
          console.log(b);
          if(b){
            await super.delete(id)
            await u2p.removeProject(id)
            resolve(true)
          }else
            reject('No Permisson');
        }else
          reject('Projekt-ID not found');
      } catch (e) {
        console.log(e);
        reject(e)
      }
    })
  }

  /**
   * [_checkPermission checked if user_id has permisson for project_id (id)]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @param  {Boolean} needAdmin  [Default: false]
   * @return {Boolean}
   */
  _checkPermission(user_id, id, needAdmin=false){
    return new Promise(async (resolve, reject) => {
      console.assert(user_id!=undefined, 'user_id is undefined');
      console.assert(id!=undefined, 'id is undefined');
      try {
        if(await this.isId(id)){
          if(await u2p.is(user_id, id) || await users.isAdmin(user_id)){
            if(!needAdmin || await users.isAdmin(user_id) || await u2p.isAdmin(user_id, id)){
              resolve(true);
            }else {
              resolve(false);
            }
          }else
            reject('No Permisson');
        }else
          reject('Projekt-ID not found');
      } catch (e) {
        console.log(e);
        reject(e)
      }

    });
  }

  /**
   * [hasAdminPermission return permisson-Rights for project]
   * @param  {Integer}  user_id
   * @param  {Integer}  id
   * @return {Boolean}
   */
  hasAdminPermission(user_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(id)){
          if(await u2p.is(user_id, id) || await users.isAdmin(user_id)){
            if(!await users.isAdmin(user_id)){
              resolve(await u2p.isAdmin(user_id, id))
            }else{
              resolve(true)
            }
          }else{
            resolve(false)
          }
        }else
          reject('Projekt-ID not found');
      } catch (e) {
        reject(e);
      }
    });
  }


  /**
   * [get return Project Settings]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {Object}
   */
  get(user_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, id)
        resolve((await super.get(id))[0])
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [_getProjectClientActivity return all client activities]
   * @param  {Integer} project_id
   * @param  {Array} client_ids
   * @return {Object}
   */
  _getProjectClientActivity(project_id, client_ids){
    return new Promise(async (resolve, reject) => {
      try {
        if(!Array.isArray(client_ids) && typeof client_ids === 'string') client_ids = [client_ids];
        client_ids = client_ids.filter(v=>v!==undefined);
        let clients = {};
        for (let id of client_ids) {
          clients[id] = {
            ACTIVITY: (await page.getMAXActivity(id, project_id))[0].ACTIVITY,
            COUNTPAGE: (await page.getCountPage(id, project_id))[0].COUNTPAGE
          }
        }//for
        resolve(clients);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getClients delivers all client activities to a project]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Array}
   */
  getClients(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        let client_ids = await page._getClientIds2Project(project_id);
        if(client_ids.length===0)
          resolve([]);
        else{
          let client_settings = await client.getClientHash(client_ids);
          let pcActivity = await this._getProjectClientActivity(project_id, client_ids);
          let clients = [];
          for (let id of client_ids){
            clients.push({
              ID: id,
              CLIENT_HASH: client_settings[id].CLIENT_HASH,
              ACTIVITY: pcActivity[id].ACTIVITY,
              COUNTPAGE: pcActivity[id].COUNTPAGE
            });
          }
          resolve(clients);
        }
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [getClientPages returns to a given client the pages in the database for a project]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Object}
   */
  getClientPages(user_id, project_id, client_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        let b = await client.isId(client_id);
        if(!b)
          reject('Client-ID not found');
        else
          page.getClientPages(project_id, client_id).then(resolve).catch(reject);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getPageEvents return list of events from page]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} page_id
   * @return {Promise} Array
   */
  getPageEvents(user_id, project_id, page_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        resolve(await events2page.get(page_id));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [deletePageEvent delete event entry from page]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} page_id
   * @param  {Integer} event_id
   * @return {Promise} Boolean
   */
  deletePageEvent(user_id, project_id, page_id, event_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        resolve(await events2page.removeEvent(page_id, event_id));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [getPageVersions returns a list of versions of a page]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} page_id
   * @return {Array}
   */
  getPageVersions(user_id, project_id, page_id){
    return new Promise(async (resolve, reject) => {
      try {

        await this._checkPermission(user_id, project_id);
        let b = await page.check(page_id);
        if(b)
          dataPage.getVersions(page_id).then(resolve).catch(reject);
        else
          reject('Page-ID not found');
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [deletePage deletes a page with its associated page versions (data's)]
   * @param  {Integer} user_id
   * @param  {Array} page_ids
   * @param  {Integer} page_id
   * @return {Boolean}
   */
  deletePage(user_id, project_id, page_ids){
    return new Promise(async (resolve, reject) => {
      try {
        if(page_ids.length===0)
          resolve();
        else{
          await this._checkPermission(user_id, project_id, true);
          for (let page_id of page_ids) {
            if(await page.check(page_id)){
              let p = await page.get(page_id);

              let children = await page.getChildren(page_id);
              if(children.length>0) await page.setPrecursorId(children, p.PRECURSOR_ID);

              await page.delete(page_id);
              await dataPage.deletePage(page_id);
              await events2page.remove(page_id);

            }
          }
          resolve();

        }
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [getPageContent get HTML-content]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @return {String}
   */
  getPageContent(user_id, project_id, page_id, version){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        if(await page.check(page_id)){
          if(await dataPage.isVersion(page_id, version))
            dataPage.getPageVersion(page_id, version, '1').then(resolve).catch(reject)
          else
            reject('Page-Version not found');
        }else
          reject('Page-ID not found');
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [deletePageContent delete the Page-content-version]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @return {Boolean}
   */
  deletePageContent(user_id, project_id, page_id, version){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id, true);
        if(await page.check(page_id)){
          if(await dataPage.isVersion(page_id, version)){
            dataPage.delete(page_id, version).then(resolve).catch(reject);
          }else
            reject('Page-Version not found');
        }else
          reject('Page-ID not found')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [getPermissions checked the permisson of User-ID and return all user have access to the project]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Array}
   */
  getPermissions(user_id, project_id){
    return new Promise((resolve, reject) => {
      this._checkPermission(user_id, project_id, true).then(b =>{
          super.getPermissions(project_id).then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  /**
   * [_checkUserAndAdminPermission checks the user-id has admin-rights or has project-admin-permission]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @return {Boolean}
   */
  _checkUserAndAdminPermission(user_id, project_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id, true);
        if(await users.isId(id))
          resolve(true);
        else
          reject('No user-id found');
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [addUserPermission add user-ID to the project-permission]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} added_user_id
   * @return {Boolean}
   */
  addUserPermission(user_id, project_id, added_user_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkUserAndAdminPermission(user_id, project_id, added_user_id);
        await u2p.add(added_user_id, project_id, 0);
        resolve(true)
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [changeUserPermission change the user-ID permisson for the project]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} change_user_id
   * @param  {Boolean} boolean
   * @return {Boolean}
   */
  changeUserPermission(user_id, project_id, change_user_id, boolean){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkUserAndAdminPermission(user_id, project_id, change_user_id);
        await u2p.change(change_user_id, project_id, (boolean? 1: 0))
        resolve(true)
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [deleteUserPermission remove the user-ID-permisson of project]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} delete_user_id
   * @return {Boolean}
   */
  deleteUserPermission(user_id, project_id, delete_user_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkUserAndAdminPermission(user_id, project_id, delete_user_id);
        await u2p.remove(delete_user_id, project_id)
        resolve(true)
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


  /**
   * [getColumns return default colume-settings for filter]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Array}
   */
  getColumns(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        let result = [
          {
            name: 'URL',
            type: 'string'
          },
          {
            name: 'TITLE',
            type: 'string'
          },
          {
            name: 'CONTENT',
            type: 'string'
          },
          {
            name: 'TYPEVERSION',
            type: 'string'
          },
          {
            name: 'DURATION',
            type: 'number',
            props: [(await page.getMinDuration(project_id))[0].value, (await page.getMaxDuration(project_id))[0].value]
          },
          {
            name: 'STARTTIME',
            type: 'date',
            props: [(await page.getMinStarttime(project_id))[0].value, (await page.getMaxStarttime(project_id))[0].value]
          },
          {
            name: 'CREATEDATE',
            type: 'date',
            props: [(await page.getMinCreateDate(project_id))[0].value, (await page.getMaxCreateDate(project_id))[0].value]
          }
        ]
        resolve(result);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getListOfClient2Project check and return object-list of clients]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array}  range         [default: []]
   * @param  {Array}  sorted        [default: []]
   * @param  {Array}  filtered      [default: []]
   * @return {Promise} Array
   */
  getListOfClient2Project(user_id, project_id, range=[], sorted=[], filtered=[]){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this._checkPermission(user_id, project_id, true))
          client.getClientsCombies2Project(project_id, range, sorted, filtered).then(resolve).catch(reject);
        else
          reject('No Permisson')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [getCountofClient2Project check and return count of combines between client and project]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Promise} Integer
   */
  getCountofClient2Project(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this._checkPermission(user_id, project_id, true))
          client.getCount(project_id).then(resolve).catch(reject);
        else
          reject('No Permisson')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [createClient2Project create list of clients]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array} list
   * @return {Promise}
   */
  createClient2Project(user_id, project_id, list){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this._checkPermission(user_id, project_id, true)){
          await client.createList(list, project_id);
          resolve()
        }else
          reject('No Permisson')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [deleteClient2Project check and delete client combine to project and if client has no data then this client will be deleted]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Promise}
   */
  deleteClient2Project(user_id, project_id, client_id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this._checkPermission(user_id, project_id, true)){
          await client.remove(client_id, project_id)
          resolve()
        }else
          reject('No Permisson')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [changeClient change hash-name of client]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @param  {String} name
   * @return {Promise}
   */
  changeClient(user_id, project_id, client_id, name){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this._checkPermission(user_id, project_id, true)){
          await client.change(client_id, name)
          resolve()
        }else
          reject('No Permisson')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }

  /**
   * [cleanClient check and delete all client combines to project and if client has no data then this client will be deleted]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Promise}
   */
  cleanClient(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this._checkPermission(user_id, project_id, true)){
          await client.clean(project_id)
          resolve()
        }else
          reject('No Permisson')
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }


}//class

module.exports = new Projekt();
