const crypto = require('crypto');
const util = require('util');
const TextEncoder = util.TextEncoder;
var log = require('./log.js');
const fetch = require('node-fetch');

var ConfigWebshrinker = require('./ConfigWebshrinker.js');

class WebshrinkerWrapper extends ConfigWebshrinker {

  constructor() {
    super()
    this.credentials = null;
    this.init();
  }


  init() {
    return new Promise(async (resolve, reject)=>{
      try {
        this.credentials = await this._read();
        if(this.credentials==null){
          console.warn('No Webshrinker Config File found');
          return;
        }
        resolve();
      } catch (e) {
        reject(e);
        }
    });
  }


  /**
  * [queries the webshrinker API for domain category]
  * @param  {String} domain
  * @return {Promise}
  */
  async queryWebshrinker(domain) {

    let ACCESS_KEY = this.credentials.ACCESS_KEY;
    let SECRET_KEY = this.credentials.SECRET_KEY;
    
    //the request is being constructed based on the instuctions of pre-signed-urls of webshrinker API
    //https://docs.webshrinker.com/v3/website-category-api.html?python#pre-signed-urls
    let encoded_domain = Buffer.from(domain).toString('base64');
    let params = `key=${ACCESS_KEY}&taxonomy=webshrinker`;
    let request = `categories/v3/${encoded_domain}?${params}`;

    let utf8Encode = new TextEncoder();
    let request_to_sign = utf8Encode.encode(`${SECRET_KEY}:${request}`);
    let signed_request = crypto.createHash('md5').update(request_to_sign).digest("hex");
    let encoded_request = `https://api.webshrinker.com/${request}&hash=${signed_request}`;

    let data = await fetch(encoded_request).then((response) => {
      if (response.ok) {
        return response.json();
      }
      log.error(response.status);
      throw new Error(response.status);
    })
    .catch((e) => {
      console.log(e)
      log.error(e);
    });
    return data;
  }

}

module.exports = new WebshrinkerWrapper();