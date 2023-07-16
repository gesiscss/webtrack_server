const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');


class ClientTableClass extends Core{

  constructor() {
    super();
    this.table = "clients";
  }

  createTable(){
    return db.promiseQuery("CREATE TABLE IF NOT EXISTS `"+this.table+"` ( `ID` INT(255) NOT NULL AUTO_INCREMENT , `CLIENT_HASH` varchar(255) NOT NULL , `CREATEDATE` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`ID`), INDEX hash_idx (`CLIENT_HASH`)) ENGINE = InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_german2_ci;");
  }

  /**
   * [is checked client-hash exist]
   * @param  {String}  client_hash
   * @return {Promise}
   */
  is(client_hash){
    return db.promiseQuery("SELECT `ID` FROM `"+this.table+"` WHERE `CLIENT_HASH` = '"+client_hash+"'");
  }

  /**
   * [create client]
   * @param {String} client_hash
   * @return {Promise}
   */
  create(client_hash){
    return db.promiseQuery("INSERT INTO `"+this.table+"` (`CLIENT_HASH`) VALUES ?", [[[client_hash]]]);
  }

  /**
   * [remove entry by id]
   * @param  {Interval} id
   * @return {Promise}
   */
  remove(id){
    return db.promiseQuery("DELETE FROM  `"+this.table+"` WHERE `ID` = '"+id+"'");
  }

  /**
   * [get return entry from id]
   * @param  {Integer} id
   * @return {Promise}
   */
  get(id){
    return db.promiseQuery("SELECT * FROM `"+this.table+"` WHERE `ID` = '"+id+"'");
  }


  /**
   * [get client id from client hash]
   * @param  {String } client_hash
   * @return {Promise}
   */
  getClientID(client_hash){
    return db.promiseQuery("SELECT ID FROM `"+this.table+"` WHERE `CLIENT_HASH` = '"+client_hash+"'");
  }


  /**
   * [getClientHash return entrys with filter]
   * @param  {Integer} project_id
   * @param  {Array} client_ids
   * @param  {Array}   range
   * @param  {Object}  sorted
   * @param  {Object}  filtered
   * @return {Promise}
   */
  getClientHash(client_ids, range=[], sorted=[], filtered=[]){
    let sql = "SELECT `ID`, `CLIENT_HASH`, `CREATEDATE` FROM `"+this.table+"` WHERE `ID` in ("+client_ids.join(',')+")";

    if(filtered.length>0)
        for (let f of filtered) sql += ' AND `'+f.id+'` LIKE "%'+f.value+'%"';
    if(sorted.length>0)
        for (let s of sorted) sql += ' ORDER BY `'+s.id+'` '+(s.desc? 'DESC': 'ASC');
    if(range.length === 2 && typeof range[0] === 'number' && typeof range[1] === 'number') sql += ' LIMIT '+range[0]+','+range[1];

    return db.promiseQuery(sql);
  }

  /**
   * [change client_hash by client_id]
   * @param  {Integer} client_id
   * @param  {String}  client_hash
   * @return {Promise}
   */
  change(client_id, client_hash){
    return db.promiseQuery("UPDATE `"+this.table+"` SET `CLIENT_HASH` = '"+client_hash+"' WHERE `ID` = "+client_id);
  }

}

module.exports = ClientTableClass;
