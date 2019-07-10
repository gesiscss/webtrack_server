var CryptHandler = function(publicKey, privateKey) {
  // console.log(publicKey);
  // console.log(privateKey);
  var self = this;
  this._getRandomString = (length) => {
      length = length || 100;
      let text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  }

  var _asymmetric = new JSEncrypt();
  _asymmetric.setPublicKey(publicKey);

  var _symmetric = {

      myEncrypt: (string) => {
        let key = self._getRandomString(32),
            iv  = self._getRandomString(32);

        let base64 = {
          key: CryptoJS.enc.Base64.parse(key),
          iv: CryptoJS.enc.Base64.parse(iv)
        }

        var encrypted = CryptoJS.AES.encrypt(string, base64.key, { iv: base64.iv });

        // console.log(key, iv, encrypted.toString());

        return {
            encrypted: encrypted.toString(),
            keys: {
              key: key,
              iv: iv
            }
        };
      },//()

      myDecrypt: (keys, encrypted) => {
        let base64 = {
          key: CryptoJS.enc.Base64.parse(keys.key),
          iv: CryptoJS.enc.Base64.parse(keys.iv)
        }
        var decrypted = CryptoJS.AES.decrypt(encrypted.toString(), base64.key, { iv: base64.iv });
        // console.log(CryptoJS.enc);
        // console.log(decrypted.toString(CryptoJS.enc.Utf8));
        return decrypted.toString(CryptoJS.enc.Utf8)
      }//()
  }

  this.encrypt = (string) => {
    let r = _symmetric.myEncrypt(string);
    return {
      encrypted: r.encrypted,
      cryptkeys: _asymmetric.encrypt(JSON.stringify(r.keys))
    }
  }

  if(typeof privateKey!=='undefined'){
    _asymmetric.setPrivateKey(privateKey);

    this.decrypt = (cryptkeys, encrypted) => {
      const keys = JSON.parse(_asymmetric.decrypt(cryptkeys));

      return _symmetric.myDecrypt(keys, encrypted);
    }
  }


}//()


if(typeof module !=='undefined'){
  var JSEncrypt = require('../3rdpart/jsencrypt').JSEncrypt;
  var CryptoJS = require("crypto-js");
  module.exports = CryptHandler;
}
