"use strict";
var tokenHandler = require('../module/lib/tokenHandler.js');
var crypto = require('crypto');

var UsersTableClass = require('./sql/UsersTableClass.js')

class Users extends UsersTableClass{

  /**
   * [check checked if name and password correct]
   * @param  {String} name
   * @param  {String} pw
   * @return {Object}      [Object of Usersettings]
   */
  check(name, pw){
    return new Promise(async (resolve, reject)=>{
      try {
        let data = await this.getData(name);
        if(this.getHashPW(pw) !== data.PW_SHA256)
          reject('Username or Password is invalid');
        else
          resolve({name: data.NAME, id: data.ID, admin: data.ADMIN, enable: data.ENABLE});
      } catch (e) {
          console.log(e);
          reject(e);
      }
    })
  }

  /**
   * [isAdmin check is Id admin]
   * @param  {Integer} id
   * @return {Boolean}
   */
  isAdmin(id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.isAdmin(id);
        resolve(rows.length>0? rows[0].ADMIN: false)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [getData check & return Userdata]
   * @param  {String} name  [e.g. aigenseer]
   * @return {Object}       [Object of User]
   */
  getData(name){
    return new Promise(async (resolve, reject)=>{
      try {
        if(await this.isUser(name)){
          resolve((await this.get(name))[0])
        }else{
          reject('No User found');
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [isUser check is Username in DB]
   * @param  {String}  name [aigenseer]
   * @return {Boolean}
   */
  isUser(name){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.isUser(name);
        resolve(rows.length > 0 && rows[0].count > 0? true: false);
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [getHashPW return Hash256 String]
   * @param  {String} string ['pw']
   * @return {String}
   */
  getHashPW(string){
    return crypto.createHmac('sha256', string).update(tokenHandler.getCryptohash()).digest('hex');
  }

  /**
   * [add User to db]
   * @param {Object} p [{ loginname: '', password: '', enable: 1,admin: 0}]
   */
  add(p){
    return new Promise(async (resolve, reject)=>{
      try {
        let u = Object.assign({}, {
          loginname: '',
          password: '',
          GIVENNAME: '',
          SURNAME: '',
          enable: 1,
          admin: 0
        }, p);
        if(await this.isUser(u.loginname)){
          reject('Username already exist! Please enter a different name');
        }else{
          resolve(await super.add(u.loginname, (u.admin? 1:0), (u.enable? 1:0), this.getHashPW(u.password)));
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [del Delete user in DB]
   * @param  {Number} id
   * @return {Boolean}
   */
  del(id){
    return new Promise(async (resolve, reject)=>{
      try {
        if(await this.isId(id)){
          resolve(await super.del(id));
        }else{
          reject('Userid not found');
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [changePw Change User Password]
   * @param  {Number} id
   * @param  {String} p
   * @return {Boolean}
   */
  changePw(id, p){
    return new Promise(async (resolve, reject)=>{
      try {
        if(await this.isId(id)){
          resolve(await super.changePw(id, this.getHashPW(p)));
        }else{
          reject('Userid not found');
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [setEnable deactivate / activate the login of a user]
   * @param {Number} id
   * @param {Boolean} p
   */
  setEnable(id, p){
    return new Promise(async (resolve, reject)=>{
      try {
        if(await this.isId(id)){
          resolve(await super.setEnable(id, (p? 1: 0)));
        }else{
          reject('Userid not found');
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [setAdmin deactivate / activate the admin rights]
   * @param {[type]} id [description]
   * @param {[type]} p  [description]
   */
  setAdmin(id, p){
    return new Promise(async (resolve, reject)=>{
      try {
        if(await this.isId(id)){
          resolve(await super.setAdmin(id, (p? 1: 0)));
        }else{
          reject('Userid not found');
        }
      } catch (e) {
        reject(e)
      }
    });
  }

}

module.exports = new Users();
