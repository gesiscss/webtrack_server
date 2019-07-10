var mysql = require('mysql');
var Config = require('./Config.js');

var db_config = {
    host: "localhost",
    user: "nodedb",
    password: "",
    database: "nodedb",
    charset: "utf8_german2_ci"
};


class MYSQLWrapper extends Config{

  constructor(props) {
    super(props)
    this._credentials = null;
    this.init = false;
    this.pool = null;
    this.installMode = false;
    this._init();
  }


  /**
   * [check // checks with credentials the connect to the server ]
   * @param  {Object} credentials
   * @return {Promise} Boolean
   */
  check(credentials){
    return new Promise((resolve, reject)=>{
      let connection = mysql.createConnection({
        host: credentials.MYSQL_HOST,
        user: credentials.MYSQL_USER,
        password: credentials.MYSQL_PASSWORD,
        database: credentials.MYSQL_DATABASE
      });
      connection.connect(err => {
        connection.end();
        if(err)
          reject(err.toString())
        else
          resolve();
      })
    })
  }

  _typeCast(field, next){
    switch (field.type) {
      case 'TINY':
        return (field.string() == '1')
        break;
      case 'VAR_STRING':
        let str = field.string();
        if(typeof str == 'string' && str.length>0 && ['{', '['].includes(str.substring(0, 1)) && ['}', ']'].includes(str.slice(-1)) )
        {
          try {
            return JSON.parse(str)
          } catch (e) {
            console.log('Failed to parse', str);
            console.log(e);
            return str;
          }
        }
        else
        {
          return str;
        }
        break;
      default:
      return next();
    }//switch
  }

  /**
   * [_DEPENDENCIES_ATTR deliver all dependecies values of the config-file]
   * @return {Array}
   */
  get _DEPENDENCIES_ATTR(){
    return ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE']
  }

  /**
   * [_init checks and created connection to the database]
   * @return {Promise}
   */
  _init(){
    return new Promise(async (resolve, reject)=>{
      try {
        if(this._credentials==null){
          let config = await this._read();
          if(config==null){
            console.warn('No Config-File found');
            return;
          }
          let _is = true;
          for (let attr of this._DEPENDENCIES_ATTR) {
            if(!config.hasOwnProperty(attr)) _is = false;
          }
          if(_is){
            this._credentials = {
              host: config.MYSQL_HOST,
              user: config.MYSQL_USER,
              password: config.MYSQL_PASSWORD,
              database: config.MYSQL_DATABASE,
              charset: "utf8mb4_german2_ci",
              typeCast: this._typeCast
            }
            this.pool = mysql.createPool(this._credentials);
            this.init = config.hasOwnProperty('INSTALL') && config.INSTALL? true: false;
          }
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  checkInit(){
    return new Promise(async (resolve, reject) => {
      try {
        let config = await this._read();
        if(config==null){
          resolve(false)
        }
        this.init = config.hasOwnProperty('INSTALL') && config.INSTALL? true: false;
        console.log('checkInit', this.init);
        resolve(this.init)
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * [_getConnect return the connection object]
   * @return {Object}
   */
  _getConnect(){
    return new Promise((resolve, reject) => {
      try {
        this._credentials = Object.assign(this._credentials, {typeCast: this._typeCast});
        this.pool.getConnection((err, connection) => {
          if (err){
            reject(err);
            Promise.reject(err)
          }else{
            resolve(connection)
          }
        })
      } catch (err) {
        resolve(err);
      }
    });
  }


  /**
   * [query pass arguments to connection.query]
   */
  query(){
    console.error('Please use promiseQuery()');
    // if(this.connection==null){
    //   // console.log(arguments);
    //   let callback = Object.values(arguments).pop();
    //   callback('Configuration-File was not filled');
    // }else
    //   this._getConnect().query(...arguments);
  }

  promiseQuery(){
    return new Promise(async (resolve, reject) => {
      try {
        if(!this.init && !this.installMode && !(await this.checkInit())){
          reject('Configuration-File was not filled');
        }else{
          let connection = await this._getConnect();
          let args = Array.from(arguments);
          args.push((error, rows, fields) => {
            if(error){
              args.pop()
              console.log(args);
              Promise.reject(error);
              reject(error)
            }else{
              resolve(rows)
            }
            connection.release();
          });
          connection.query(...args);
        }
      } catch (e) {
        reject(e)
      }
    })
  }

}

module.exports = new MYSQLWrapper();
