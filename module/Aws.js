var AwsTableClass = require('./sql/AwsTableClass.js')

class Aws extends AwsTableClass{

  /**
   * [get return the settings of AWS]
   * @param  {Integer} id
   * @return {Promise} Object
   */
  get(id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(id)){
          let rows = await super.get(id);
          rows[0].DESTINATION = 'aws';
          resolve(rows[0]);
        }else
          reject('ID not found')
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [get return only the settings of some public client from AWS]
   * @param  {Integer} id
   * @return {Promise} Object
   */
  getPublicSettings(id){
    return new Promise((resolve, reject) => {
      this.get(id).then(s => {
        delete s.WRITEONLY_NAME;
        delete s.FULLRIGTH_NAME;
        delete s.FULLRIGTH_ACCESSKEYID;
        delete s.FULLRIGTH_SECRETACCESSKEY;
        resolve(s);
      }).catch(reject);
    });
  }

  /**
   * [remove delete the entry of AWS]
   * @param  {Integer} id
   * @return {Promise} Object
   */
  remove(id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(id)){
          await super.remove(id);
          resolve();
        }else
          reject('ID not found')
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [change check the settings if they exist and change it]
   * @param  {Integer} id
   * @param  {Object} settings
   * @return {Promise} Object
   */
  change(id, settings){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(id)){
          await super.change(id, settings);
          resolve();
        }else
          reject('ID not found')
      } catch (e) {
        reject(e)
      }
    });
  }

}//class

module.exports = new Aws();
