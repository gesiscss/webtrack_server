var Cronjob2projectTableClass = require('./sql/Cronjob2projectTableClass.js')

class Cronjob2Projekt extends Cronjob2projectTableClass{


  /**
   * [_checkTypeExist check if type name and return error with not exist]
   * @param  {Integer} project_id
   * @param  {String} type
   * @return {Promise} Boolean
   */
  _checkTypeExist(project_id, type){
    return new Promise(async (resolve, reject)=>{
      try {
        if(project_id==undefined || type == undefined)
          reject('Parameter not found');
        else if(await this.is(project_id, type))
          resolve(true);
        else
          reject('Cronjob '+type+' not found');
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [is return boolean if type name exist]
   * @param  {Integer} project_id
   * @param  {String}  type
   * @return {Promise} Boolean
   */
  is(project_id, type){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.is(project_id, type);
        resolve(rows.length>0 && rows[0].count>0);
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [getSettings return object of colums]
   * @param  {Integer} project_id
   * @param  {String}  type
   * @return {Promise} Object
   */
  getSettings(project_id, type){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        let rows = await super.getSettings(project_id, type);
        resolve(rows[0])
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [add create new entry in cronjob table]
   * @param {Integer} project_id
   * @param {String}  type
   * @param {Integer} interval       [default: 900]
   * @param {Boolean} active         [default: false]
   * @param {Boolean} enable        [default: true]
   */
  add(project_id, type, interval=900, active=false, enable=true){
    return new Promise(async (resolve, reject)=>{
      try {
        if(await this.is(project_id, type)){
          reject('Cronjob type '+type+' already exist');
        }else{
          let rows = await super.add(project_id, type, interval, active, enable);
          resolve(rows.insertId)
        }
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [remove delete entry from db]
   * @param {Integer} project_id
   * @param  {String} type
   * @return {Promise} Object
   */
  remove(project_id, type){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        resolve(await super.remove(project_id, type));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [setEnable change the value of state enable]
   * @param {Integer} project_id
   * @param {String}  type
   * @param {Promise} Boolean    [Default: true]
   */
  setEnable(project_id, type, boolean=true){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        resolve(await super.setEnable(project_id, type, boolean));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [setInterval change the interval number]
   * @param {Integer} project_id
   * @param {String} type
   * @param {Number} number       [default: 5]
   */
  setInterval(project_id, type, number=5){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        resolve(await super.setInterval(project_id, type, number));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [setActive change the value of state active]
   * @param {Integer} project_id
   * @param {String}  type
   * @param {Promise} Boolean   [Default: true]
   */
  setActive(project_id, type, boolean=true){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        resolve(await super.setActive(project_id, type, boolean));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [isActive return the state of active]
   * @param {Integer} project_id
   * @param  {String}  type
   * @return {Promise} Boolean
   */
  isActive(project_id, type){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        let rows = await super.isActive(project_id, type)
        resolve(rows[0].ACTIVE)
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [updateActivity update the activity]
   * @param  {Integer} project_id
   * @param  {String}  type
   * @return {Promise} Object
   */
  updateActivity(project_id, type){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkTypeExist(project_id, type);
        resolve(await super.updateActivity(project_id, type));
      } catch (e) {
        reject(e)
      }
    });
  }

}

module.exports = new Cronjob2Projekt();
