"use strict";
const Config = require('./Config.js');
const nodemailer = require("nodemailer");

const DEFAULT_SETTINGS = require("./mailer_default_settings.json");

module.exports = class Mailer extends Config{

  constructor(props) {
    super(props);
    this.CONFIG_PATH = 'mailer.json';
    this.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    this._init();
    this.transporter = null;
  }

  /**
   * [_init check and create config file if not exist. If file exist and settings not the same like default settings and the function create the transporter object]
   */
  async _init(){
    try {
      if(!this._isFile){
        await this._create(DEFAULT_SETTINGS);
      }else{
        let settings = await this._read();
        if(Object.keys(settings).length>0 && Object.keys(settings.credentials).length>0 && JSON.stringify(settings.credentials).length != JSON.stringify(DEFAULT_SETTINGS.credentials).length){
          this.transporter = nodemailer.createTransport(settings.credentials);
          this.settings = settings;
        }
      }
    } catch (e) {
      Promise.reject(e);
    }
  }

  /**
   * [sendMail send mail]
   * @param  {Object} options [default: {}]
   * @return {Promise} info
   */
  sendMail(options={}){
    return new Promise(async (resolve, reject) => {
      try {
        if(this.transporter==null){
          reject('Settings for mailer credentials not defined');
        }else{
          let msg = Object.assign({}, DEFAULT_SETTINGS.mailOptions, this.settings.mailOptions, options);
          let info = await this.transporter.sendMail(msg)
          resolve(info);
        }
      } catch (e) {
        reject(e)
      }
    });
  }


}//class
