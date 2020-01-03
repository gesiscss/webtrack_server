"use strict";
var Client2ProjectTableClass = require('./sql/Client2ProjectTableClass.js')
var ClientTableClass = require('./sql/ClientTableClass.js')

class Client extends ClientTableClass{

  constructor() {
    super();
    this.c2p = new Client2ProjectTableClass();
  }

  /**
   * [is checked client-hash exist]
   * @param  {String}  client_hash
   * @return {Boolean}
   */
  is(client_hash){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await super.is(client_hash);
        resolve(rows.length>0? rows[0]: false)
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [checkIncludes2Project check client_id is combines with project]
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Promise}
   */
  checkIncludes2Project(project_id, client_id){
    return new Promise((resolve, reject) => {
      this.c2p.getList(project_id).then(l => {
        if(l.length===0 || !l.includes(client_id)){
          this.c2p.add(project_id, client_id).then(resolve).catch(reject)
        }else
          resolve(true);
      }).catch(reject)
    })
  }

  /**
   * [isClient2Project check if the client has been assigned to the respective project]
   * @return {Promise} Boolean
   */  
   isClient2Project(client_id, project_id){
      return this.c2p.isClient2Project(client_id, project_id);
  }


  /**
   * [create client and return settings]
   * @param  {String} client_hash
   * @param  {Integer} project_id
   * @return {Object}
   */
  create(client_hash, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let c = await this.is(client_hash);
        if(c){
          await this.checkIncludes2Project(project_id, c.ID);
          this.get(c.ID).then(resolve).catch(reject)
        }else{
           let id = (await super.create(client_hash)).insertId;
           let client = await this.get(id);
           await this.checkIncludes2Project(project_id, client.ID);
           resolve(client)
        }
      } catch (e) {
        console.log(e);
        reject(e)
      }
    });
  }//()


  /**
   * [remove remove client combine to project and if client has no data then this will be deleted]
   * @param  {Integer} client_id
   * @param  {Integer} project_id
   * @return {Promise}
   */
  remove(client_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(client_id)){
          let list = await this.c2p.getCombinesClient2Project(client_id);
          let count = await this.c2p.getCountOfClientData(client_id);
          if(list.length>=1){
            await this.c2p.delete(project_id, client_id);
            if(count>0)
              resolve();
            else{
              await super.remove(client_id);
              resolve();
            }
          }else
            resolve();
        }else
          resolve();
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [createList list of clients]
   * @param  {Array} list
   * @param  {Integer} project_id
   * @return {Promise}
   */
  createList(list, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        for (let e of list) {
          let client_id = e.replace(/\s/g, '');
          if (client_id != ''){
            await this.create(client_id, project_id);
          }
        }
        resolve();
      } catch (e) {
        reject(e)
      }
    })
  }


  /**
   * [_removeList remove all client combines to project and if client has no data then this will be deleted]
   * @param  {Array} list
   * @param  {Integer} project_id
   * @return {Promise}
   */
  _removeList(list, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        for (let id of list) await this.remove(id, project_id);
        resolve();
      } catch (e) {
        reject(e)
      }
    })
  }


  /**
   * [clean remove all client combines to project and if client has no data then this will be deleted]
   * @param  {Integer} project_id
   * @return {Promise}
   */
  clean(project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let l = await this.c2p.getList(project_id);
        this._removeList(l, project_id).then(resolve).catch(reject);
      } catch (e) {
        reject(e)
      }
    })
  }



  /**
   * [get return client-settings]
   * @param  {Integer} id
   * @return {Object}
   */
  get(id){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await super.get(id);
        resolve(rows.length>0? rows[0]: false)
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [get return client id from client_hash]
   * @param  {String} client_hash
   * @return {Object}
   */
  getClientID(client_hash){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await super.getClientID(client_hash);
        resolve(rows.length>0? rows[0].ID : false)
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getClientHash return client-settings]
   * @param  {Integer} project_id
   * @param  {Array/Integer} client_ids
   * @param  {Array}   range
   * @param  {Object}  sorted
   * @param  {Object}  filtered
   * @param  {asList}  Boolean      [default: false]
   * @return {Promise} Object
   */
  getClientHash(client_ids, range=[], sorted=[], filtered=[], asList=false){
    return new Promise(async (resolve, reject) => {
      if(!Array.isArray(client_ids)) client_ids = [client_ids];
      try {
        let rows = await super.getClientHash(client_ids, range, sorted, filtered);
        if(asList)
          resolve(rows);
        else{
          let clients = {};
          for (let e of rows)  clients[e.ID] = { CLIENT_HASH: e.CLIENT_HASH, CREATEDATE: e.CREATEDATE }
          resolve(clients);
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getHashCombies2Project get list of client-hash]
   * @param  {Integer} project_id
   * @return {Promise} Array
   */
  getHashCombies2Project(project_id){
    return new Promise(async (resolve, reject) => {
      try {
        let l = await this.c2p.getList(project_id);
        if(l.length===0)
          resolve(l)
        else{
          let c = await this.getClientHash(l);
          resolve(Object.values(c).map(v=>v.CLIENT_HASH))
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [get return count of clients]
   * @param  {Integer} project_id
   * @return {Object}
   */
  getCount(project_id){
    return new Promise((resolve, reject) => {
      this.c2p.getList(project_id).then(l => resolve(l.length)).then(reject)
    });
  }

  /**
   * [getClientHash get list of client-hash]
   * @param  {Integer} project_id
   * @param  {Array}   range
   * @param  {Object}  sorted
   * @param  {Object}  filtered
   * @return {Promise} Object
   */
  getClientsCombies2Project(project_id, range=[], sorted=[], filtered=[]){
    return new Promise(async (resolve, reject) => {
      try {
        let l = await this.c2p.getList(project_id);
        if(l.length===0)
          resolve(l)
        else
          this.getClientHash(l, range, sorted, filtered, true).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }



  /**
   * [change change client_hash by client_id]
   * @param  {Integer} client_id
   * @param  {String}  client_hash
   * @return {Promise}
   */
  change(client_id, client_hash){
    return new Promise(async (resolve, reject) => {
      try {
        let is = await this.isId(client_id);
        if(!is)
          reject('Client-ID not found');
        else{
            await super.change(client_id, client_hash);
            resolve();
        }
      } catch (e) {
        reject(e)
      }
    });
  }




}//class


module.exports = {
  client: new Client(),
  Class: Client
}
