var tokenHandler = require('./tokenHandler.js');

module.exports = class IO {

  constructor(req, res) {
    this.request = req || null
    this.response = res || null
    this.authData = null;
    this.resError = this.resError.bind(this);
    this.res = this.res.bind(this);
  }

  /**
   * [getResError return default construct of error-object for response]
   * @param  {Array} error
   * @return {Object}       [{message: 'message', code: 'code', nr: 404}]
   */
  getResError(error){
    let message = error[0] || error.sqlMessage || 'No data send';
    let code = error[1] || error.code || 'ERROR';
    let nr = error[2] || '';
    return {message: message, code: code, nr: nr}
  }

  /**
   * [getFullResponse return default construct of object for response]
   * @param  {Object} authData
   * @param  {Object/Array/Boolean} data
   * @param  {Object} error
   * @return {Object}
   */
  getFullResponse(authData = result.authData, data = null, error = null){
    if(error!=null && error.constructor.name==='Error') error = this.getResError(error);
    return {error: error, result: {authData: authData, data : data}};
  }


  /**
   * [getBody return body from request]
   * @param  {Object} req [request-object from express-router]
   * @return {Object}
   */
  getBody(){
    return this.request.hasOwnProperty('body') && Object.keys(this.request.body).length==0? {}: this.request.body;
  }

  /**
   * [verify // verify request and return authData oder response error-msg back]
   * @param  {Object} req                  [response-object from express-router]
   * @param  {Boolean} needAdminPermissions [default: false]
   * @return {Object} authData             [e.g {id: 12}]
   */
  verify(needAdminPermissions=false){
    return new Promise((resolve, reject)=>{
      tokenHandler.verifyRequest(this.request).then(authData =>{
        if(needAdminPermissions && !authData.admin)
          reject('No Permisson');
        else
          resolve(authData);
      }).catch(reject)
    });
  }

  /**
   * [res callback json-success-response]
   * @param  {Object/Buffer} authData  [e.g {id: 12}]
   * @param  {Object/Array/Boolean} data
   */
  res(data){
    // console.log(typeof data);
    // console.log(Buffer.isBuffer(data));
    if(this.response != null && !this.response.finished){
      if(Buffer.isBuffer(data)){
        this.response.send(data)
      } else if(this.response!= null) {
        this.response.json(this.getFullResponse(this.authData, data))
      }
      this.response = null;
    }


    // console.log('res=>', data.length>20? data.toString().split(0, 20): data);

  }

  /**
   * [resError callback json-error-response]
   * @param  {Object} res       [response-object from express-router]
   * @param  {Array/String} error
   */
  resError(err){
    var responseError = this.getResError(err);
    // console.log(typeof err, err.constructor.name);
    // console.log(err);
    switch (err.constructor.name) {
      case 'String':
        responseError.message = err;
        responseError.code = 'Error';
        responseError.nr = null;
      break;
      case 'ValidationError':
          let _r = [];
          for (let head in err.validationErrors)
            _r = _r.concat(err.validationErrors[head].map(p => p.message));
          responseError.message = _r.join('<br/>');
          responseError.code = err.constructor.name;
          responseError.nr = 406;
        break;
        case 'Error':
        responseError.message = err.message;
        responseError.code = err.code;
        responseError.nr = err.statusCode;
        break;
      default:
      try {
        // console.log(err);
        responseError.message = err.message;
        responseError.code = err.code;
        responseError.nr = err.statusCode;
      } catch (e) {
        console.log(e);
      }
    }

    // console.log('ERROR!---------------');
    // console.log(this.getFullResponse(null, null, responseError));
    // console.log(err.constructor.name);
    // console.log('ERROR!---------------');
    if(this.response != null && !this.response.finished){
      // if(typeof responseError.nr === 'number'){
      //   console.log(responseError.nr);
      //   this.response.status(responseError.nr || 500);
      // }
      if(!err.toString().includes('jwt malformed')){
        Promise.reject(err)
      }
      this.response.json(this.getFullResponse(null, null, responseError))
      this.response = null;
    }

  }

  /**
   * [handleReqAndRes description]
   * @param  {Boolean} needVerify            [default=true]
   * @param  {Boolean} needAdminPermissions  [default=false]
   * @return {Integer} id                    [user-id]
   * @return {Object} body
   */
  handleReqAndRes(needVerify = true, needAdminPermissions = false){
    return new Promise((resolve, reject)=>{
      let body = this.getBody();
      // console.log('handleReqAndRes=>', needVerify, needAdminPermissions, body);
      if(needVerify){

        this.verify(needAdminPermissions)
           .then(authData => {
              this.authData = authData;
              resolve({id: authData.id, body: body})
            })
           .catch(this.resError)
      }else{
        resolve({user_id: null, body: body});
      }
    });
  }


}
