"use strict";
var project = require('../module/Project');
var sd2p  = require('../module/StorageDestination2Project');
var cron2p  = require('../module/Cronjob2Projekt');

var IAMService  = require('../module/lib/aws/IAMService');
var S3Service  = require('../module/lib/aws/S3Service');

var storage = {
  aws: require('../module/Aws')
}

var ProjektSettingsTableClass = require('./sql/ProjektSettingsTableClass.js')


class Settings extends ProjektSettingsTableClass{

  /**
   * [is checks settings-id exist]
   * @param  {String}  id
   * @return {Boolean}
   */
  is(id){
    return new Promise((resolve, reject)=>{
      if(this.COLUMN.indexOf(id)<0){
        reject('Settings-ID not allowed');
      }else{
        resolve(true);
      }
    });
  }

  /**
   * [_checkPermission check Permisson]
   * @param  {Integer} user_id    [description]
   * @param  {Integer} project_id [description]
   * @return {Boolean}            [description]
   */
  _checkPermission(user_id, project_id){
    return new Promise((resolve, reject)=>{
      project._checkPermission(user_id, project_id).then(resolve).catch(reject)
    });
  }

  /**
   * [fetch return all entrys]
   * @param  {Array/Integer} project_id
   * @return {Object}
   */
  fetch(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let isNumber = false;
        if(typeof project_id === 'number'){
          isNumber = true;
          project_id = [project_id]
        }
        let rows = await super.fetch(project_id)
        if(isNumber){
          delete rows[0].ID;
          resolve(rows[0])
        }else{
          resolve(this.sortByColume('ID', rows))
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [fetch return all entrys]
   * @param  {Array/Integer} project_id
   * @return {Object}
   */
  fetchOne(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.fetchOne(project_id)
        resolve(rows[0])
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [get check Permisson and return all settings]
   * @param  {Integer} user_id    [description]
   * @param  {Integer} project_id [description]
   * @return {Object}            [description]
   */
  get(user_id, project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this._checkPermission(user_id, project_id);
        resolve(await this.fetch(project_id))
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [_setBoolean change boolean value of setting]
   * @param {Integer} project_id
   * @param {String} id
   * @param {boolean} boolean
   */
  _setBoolean(project_id, id, boolean){
    return new Promise((resolve, reject)=>{
      boolean = boolean? 1 : 0;
      this.set(project_id, id, boolean).then(resolve).catch(reject);
    });
  }


  /**
   * [change check and change value of settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @param  {Boolean} boolean
   * @return {Boolean}
   */
  changeBoolean(user_id, project_id, id, boolean){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        await this.is(id);
        this._setBoolean(project_id, id, boolean).then(resolve).catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [changeValue change values of settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @param  {Unkown} value [default: '']
   * @return {Boolean}
   */
  changeValue(user_id, project_id, id, value=''){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        await this.is(id);
        if(typeof value==='object') value = JSON.stringify(value);
        this.set(project_id, id, value).then(resolve).catch(reject);
      } catch (e) {
        reject(e)
      }
    })
  }


  /**
   * [storage_get check permisson and return storage settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Promise} Object
   */
  storage_get(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        let [destination, id] = await sd2p.get(project_id);
        let config = await storage[destination].get(id);
        let settings = await cron2p.getSettings(project_id, 'storage');
        config.cron = {
          ENABLE: settings.ENABLE,
          SECINTERVAL: settings.SECINTERVAL,
          LASTACTIVITY: settings.LASTACTIVITY
        }
        resolve(config);
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [storage_change check permisson and change storage settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Object} settings
   * @return {Promise} Object
   */
  storage_change(user_id, project_id, settings){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        await cron2p.setEnable(project_id, 'storage', settings.cron.ENABLE);
        await cron2p.setInterval(project_id, 'storage', settings.cron.SECINTERVAL);
        delete settings.cron;
        let [destination, id] = await sd2p.get(project_id);
        resolve(await storage[destination].change(id, settings));
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [storage_remove check permisson and remove storage settings]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Promise} Object
   */
  storage_remove(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);
        let [destination, id] = await sd2p.get(project_id);
        await storage[destination].remove(id);
        await sd2p.remove(project_id);
        await cron2p.remove(project_id, 'storage');
        await this._setBoolean(project_id, 'STORAGE_DESTINATION', false);
        resolve();
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [storage_set check permisson, create spezific storage and return settings from the storage]
   * @param {Integer} user_id
   * @param {Integer} project_id
   * @param {String} destination
   * @param {Object} credentials
   * @return {Promise} Object
   */
  storage_set(user_id, project_id, destination, credentials){
    return new Promise(async (resolve, reject) => {
      try {
        await this._checkPermission(user_id, project_id);

        switch (destination) {
          case 'aws':
            let iam = new IAMService(credentials.AccessKeyId, credentials.SecretAccessKey);
            var user = await iam.initSQSUser();
            let s3 = new S3Service(credentials.AccessKeyId, credentials.SecretAccessKey);
            let bucket = await s3.create('webtrackproject-'+project_id+'-'+s3.getRandomStr(10).toLowerCase());
            let r = Object.assign({}, user, {bucket: bucket});

            let aws_id = await storage.aws.add(r.WRITEONLY_USER.UserName, r.WRITEONLY_USER.accessKeyId, r.WRITEONLY_USER.secretAccessKey, r.FULLRIGTH_USER.UserName, r.FULLRIGTH_USER.accessKeyId, r.FULLRIGTH_USER.secretAccessKey, r.bucket);
            await sd2p.add(project_id, destination, aws_id);
            let c = await storage.aws.get(aws_id);

            await this._setBoolean(project_id, 'STORAGE_DESTINATION', true);
            await cron2p.add(project_id, 'storage', 900);
            let config = await this.storage_get(user_id, project_id);

            resolve(config);

            break;
          default:
            throw new Error('Destination not found');
        }
      } catch (e) {
        reject(e)
      }

    })
  }




}//class

module.exports = new Settings();
