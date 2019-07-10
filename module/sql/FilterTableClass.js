const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


module.exports = class FilterTableClass extends Core{

  constructor(props) {
    super(props);
    this.table = "filter";
  }

  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `NAME` VARCHAR(255) NOT NULL , `GROUP_ID` INT(255) NOT NULL , `COLUME` VARCHAR(255) NOT NULL , `TYPE` VARCHAR(255) NOT NULL , `VALUE` TEXT NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`ID`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [add // add filter to group with Settings]
   * @param {Integer} group_id
   * @param {String} name
   * @param {String} colume   [e.g. 'URL', 'TITLE', 'Content']
   * @param {String} type     [e.g. 'string', 'number', 'date']
   * @param {String} value
   * @param {Promise}
   */
  add(group_id, name, colume, type, value){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`ID`, `NAME`, `GROUP_ID`, `COLUME`, `TYPE`, `VALUE`, `CREATEDATE`) VALUES (NULL, '"+name+"', '"+group_id+"', '"+colume+"', '"+type+"', '"+value+"', CURRENT_TIMESTAMP)");
  }

  /**
   * [change // change Filtersettings]
   * @param  {Integer} id
   * @param  {String} name
   * @param  {String} colume  [e.g. 'URL', 'TITLE', 'Content']
   * @param  {String} type    [e.g. 'string', 'number', 'date']
   * @param  {String} value
   * @return {Promise}
   */
  change(id, name, colume, type, value){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `NAME` = '"+name+"', `COLUME` = '"+colume+"', `TYPE` = '"+type+"', `VALUE` = '"+value+"' WHERE `ID` = "+id);
  }

  /**
   * [removeGroup delete all filter coupled with group-id]
   * @param  {Integer} user_id
   * @param  {Integer} group_id
   * @return {Promise}
   */
  removeGroup(group_id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `GROUP_ID` = "+group_id);
  }

  /**
   * [remove // remove filter]
   * @param  {Integer} user_id
   * @param  {Integer} id
   * @return {Promise}
   */
  remove(id){
    return db.promiseQuery("DELETE FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [get return filter Settings]
   * @param  {Integer} id
   * @return {Object}
   */
  get(id){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `ID` = "+id);
  }

  /**
   * [getAll return content of filters by ids]
   * @param  {Array} ids [default: []]
   * @return {Promise}
   */
  getAll(ids=[]){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `ID` in ("+ids.join(',')+")");
  }

  /**
   * [_getAllFilter return all filters with coupled by group_id]
   * @param  {Array}  group_ids [default: []]
   * @return {Promise}
   */
  getAllFilter(group_ids=[]){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `GROUP_ID` in ("+group_ids.join(',')+")");
  }


  /**=============AUSGLIEDERN=========**/

  // /**
  //  * [is check is group coupled with project-id]
  //  * @param  {Integer}  group_id
  //  * @param  {Integer}  project_id
  //  * @return {Boolean}
  //  */
  // is(group_id, project_id){
  //   return db.promiseQuery("SELECT count(`ID`) as count FROM `filtergroup2project` WHERE `GROUP_ID` = "+group_id+" and `PROJEKT_ID` = "+project_id);
  // }


}//class
