const db = require('../lib/Db.js');
const Core = require('../lib/Core.js');

//var EXAMPLE_TableClass = require('./sql/EXAMPLE_TableClass.js')

module.exports = class EXAMPLE_TableClass extends Core{

  constructor() {
    super();
    this.table = "TABLE";
  }

  /**
   * [createTable create table]
   * @return {Promise}
   */
  createTable(){
    return db.promiseQuery("");
  }

  xy1(){
    return db.promiseQuery("");
  }

  xy2(){
    return db.promiseQuery("");
  }

  xy3(){
    return db.promiseQuery("");
  }

  xy4(){
    return db.promiseQuery("");
  }

  xy5(){
    return db.promiseQuery("");
  }

  xy6(){
    return db.promiseQuery("");
  }

  xy7(){
    return db.promiseQuery("");
  }

  xy8(){
    return db.promiseQuery("");
  }

  xy9(){
    return db.promiseQuery("");
  }



}//class
