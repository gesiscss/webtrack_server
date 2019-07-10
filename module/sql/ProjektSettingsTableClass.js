const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

module.exports = class ProjektSettingsTableClass extends Core{

  constructor() {
    super();
    this.table = "project";
    this.COLUMN = ['SCHEDULE', 'ACTIVE', 'ENTERID', 'CHECK_CLIENTIDS', 'SENDDATAAUTOMATICALLY', 'PRIVATEBUTTON', 'SHOWHISTORY', 'EDITHISTORY', 'SHOW_DOMAIN_HINT', 'ACTIVE_URLLIST', 'URLLIST_WHITE_OR_BLACK', 'EXTENSIONSFILTER', 'STORAGE_DESTINATION', 'FORGOT_ID', 'PRIVATETAB'];
    this.PRIVATE_COLUME = ['ID']
  }

  /**
   * [fetch return all columes]
   * @param  {Array} project_id
   * @return {Object}
   */
  fetch(project_id=[]){
    let sql = "SELECT ";
    let columes = this.PRIVATE_COLUME.concat(this.COLUMN);
    for (var i = 0; i < columes.length; i++) {
      sql += '`'+columes[i]+'`';
      if(columes.length-1!=i) sql += ',';
    }
    sql += " FROM `"+this.table+"` WHERE `ID` in ("+project_id.join(',')+")";
    return db.promiseQuery(sql);
  }

  /**
   * [set check if colume exist and change it]
   * @param {[type]} project_id [description]
   * @param {[type]} colume     [description]
   * @param {[type]} value      [description]
   */
  set(project_id, colume, value){
    return new Promise((resolve, reject) =>{
      colume = colume.toUpperCase();
      if(!this.COLUMN.includes(colume)){
        reject('Colume '+colume+' not found');
      }else{
        db.promiseQuery("UPDATE `"+this.table+"` SET `"+colume.toUpperCase()+"` = '"+value+"' WHERE `ID` = "+project_id).then(resolve).catch(reject);
      }
    });
  }


}//class
