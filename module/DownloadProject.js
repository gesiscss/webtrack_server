var Download = require('./Download.js');
var ProjektTableClass = require('./sql/ProjektTableClass.js')
var DownloadTableClass = require('./sql/DownloadTableClass.js')
const SubProcess = require('./lib/SubProcess');

class DownloadProject extends Download{


  /**
   * [add new download entry and deliver id]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array} filter_ids   [default: []]
   * @param  {Integer} level      [Number of level to get text or html code]
   * @param {Number} [level=1]       [description]
   * @return {Promise} insertId
   */
  add(user_id, project_id, filter_ids=[], level=1){
    return new Promise(async (resolve, reject) => {
      try {
        var insertId = (await super.add(project_id, user_id, level, filter_ids)).insertId;
        let subprocess = new SubProcess();
        subprocess.createDownloadFile({entry_id: insertId});
        resolve(insertId);
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * [onStart start to create all open files]
   */
  async onStart(){
    try {

      let projektTable = new ProjektTableClass();
      let downloadTable = new DownloadTableClass();
      let ids = (await projektTable.getAllIds()).map(e => e.ID);
      for (const id of ids) {
        let entry_id_list = (await downloadTable.getList(id)).filter(e => e.IS_FILE == false && e.ERROR == null).map(e => e.ID);
        if(entry_id_list.length>0) console.log('entry_id_list', entry_id_list);
        for (let entry_id of entry_id_list) {
          let subprocess = new SubProcess();
          subprocess.createDownloadFile({entry_id: entry_id});
        }
      }
    } catch (e) {
      Promise.reject(e);
    }
  }


}

module.exports = new DownloadProject();
