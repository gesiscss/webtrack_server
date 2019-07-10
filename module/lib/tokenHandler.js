var jwt = require('jsonwebtoken');

const CRYPTO_HASH = 'a7e3f56048b4c33a5a6ddd3f05f2a55c6533264c95f72a3a88f63632ca5323e1';

class TokenHandler {

  /**
   * [getCryptohash return CRYPTO_HASH]
   * @return {String}
   */
  getCryptohash(){
    return CRYPTO_HASH;
  }

  /**
   * [sign return authData and token]
   * @param  {Object} data    [e.g {id: 12}]
   * @return {Object} authData [e.g {id: 12}]
   * @return {Object} token    [e.g. Ysdsduihsse..]
   */
  sign(data){
    return new Promise((resolve, reject)=>{
      jwt.sign(data, this.getCryptohash(), { expiresIn: 60*60 }, (err, token) => {
      // jwt.sign(data, this.getCryptohash(), { expiresIn: 3 }, (err, token) => {
      // jwt.sign({ exp: Math.floor(Date.now() / 1000) - 30, data: data }, this.getCryptohash(), (err, token) => {
        if(err)
          reject(err)
        else
          this.verify(token).then(authData =>{
            resolve({authData: authData, token: token});
          }).catch(reject)
      });
    })//Promise
  }

  /**
   * [getToken return token-string from request-headers]
   * @param  {Object} req    [request-object from express-router]
   * @return {String} token  [e.g. Ysdsduihsse..]
   */
  getToken(req){
    return new Promise((resolve, reject)=>{
      const authorization = req.headers['authorization'];
      if(typeof authorization === 'string' && authorization.length > 7){
        resolve(authorization)
      }else{
        reject('You have no access.')
      }
    });
  }

  /**
   * [verify checks token and return authData]
   * @param  {String} token     [e.g. Ysdsduihsse..]
   * @return {Object} authData  [e.g {id: 12}]
   */
  verify(token){
    return new Promise((resolve, reject)=>{
      jwt.verify(token, this.getCryptohash(), (err, authData)=>{
        // console.log('authData=>', authData);
        if(err)
          reject(err)
        else
          resolve(authData)
      });
    });
  }

  /**
   * [verifyRequest check request to has token and check this]
   * @param  {Object} req [request-object from express-router]
   * @return {Object} authData  [e.g {id: 12}]
   */
  verifyRequest(req){
    return new Promise((resolve, reject)=>{
      this.getToken(req).then(token => {
        this.verify(token).then(resolve).catch(reject)
      }).catch(reject);
    });
  }

}//class

module.exports = new TokenHandler();
