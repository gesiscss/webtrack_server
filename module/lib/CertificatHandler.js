var path = require("path");
var fs = require('fs');
var OpenSSLHandler = require('./OpenSSLHandler');


class CertificatHandler extends OpenSSLHandler{

  constructor(props) {
    super(props);
    this.path = {
      cert: path.resolve(this.FOLDERPATH+'cert.pem'),
      key: path.resolve(this.FOLDERPATH+'key.pem'),
      chain: path.resolve(this.FOLDERPATH+'chain.pem'),
    }
  }

  /**
   * [_chain content of chain]
   * @return {String}
   */
  get _chain(){
    return this._loadCert(this.path.chain)
  }

  /**
   * [_cert cert content]
   * @return {String}
   */
  get _cert() {
    return this._loadCert(this.path.cert);
  }

  /**
   * [_key key content]
   * @return {String}
   */
  get _key() {
    return this._loadCert(this.path.key);
  }

  /**
   * [getCert deliver content of cert and optional with chain]
   * @param  {Boolean} chain [default: false]
   * @return {String}
   */
  getCert(chain=false) {
    let cert = this._cert;
    if(chain) cert = cert+this._chain;
    return cert;
  }

  /**
   * [getKey deliver content of key]
   * @return {String}
   */
  getKey(){
    return this._key;
  }

}

module.exports = new CertificatHandler();
