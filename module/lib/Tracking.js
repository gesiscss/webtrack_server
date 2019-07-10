"use strict";
var streamBuffers = require("stream-buffers");
var CryptHandler = require('./CryptHandler.js');

var OpenSSLHandler = require('./OpenSSLHandler');
var clientCertHandler = new OpenSSLHandler();

var fs = require('fs');
var unzip = require('unzip');
var path = require("path");


const debug = false;

class Tracking {

  constructor() {
    clientCertHandler.getKey().then(key => {
      clientCertHandler.getCert().then(cert => {
          this.crypt = new CryptHandler(cert, key);
      });
    });
  }

  // return RandomString
  _getRandomString(length) {
      length = length || 100;
      let text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  }


  /**
   * [saveFile decrypt zipfile and saves on tmp-path]
   * @param  {Object} cryptzip [file]
   * @return {String} tmpPath  [e.g. /tmp/Xyfile.zip]
   */
  _saveFile(cryptzip){
    return new Promise((resolve, reject) => {
      fs.readFile(cryptzip.path, 'utf8', (err, data) => {
        if (err)
          reject(err)
        else {
          let r = JSON.parse(data);

          if(typeof r.cryptkeys !== 'string'){
            reject('Key not string')
            return;
          }

          if(debug) console.log('Decrypt String');
          let string = this.crypt.decrypt(r.cryptkeys, r.encrypted);
          if(debug) console.log('Create Buffer');


          if(string.substring(0, 28)!=='data:application/zip;base64,')
            reject('Fail to cut Faile');
          else{
            let data = string.substring(28, string.length-1);
            let ext = 'zip';
            //OLD CUT
            // var regex = /^data:.+\/(.+);base64,(.*)$/;
            // var matches = string.match(regex);
            // var ext = matches[1];
            // var data = matches[2];

            let buffer = new Buffer(data, 'base64');
            let tmpPath = '/tmp/'+this._getRandomString(15)+'.'+ext;
            if(debug) console.log('Write File' + tmpPath);

            fs.writeFile(tmpPath, buffer, () =>{
              if(debug) console.log('The file '+tmpPath+' has been saved!');
              resolve(tmpPath)
            });//writeFile
          }
        }
      });//readFile

    });//
  }//saveFile

  /**
   * [getZipContent description]
   * @param  {String} zipPath [e.g. /tmp/7sdffmsfskho.zip]
   * @return {Object}         [data.json-content]
   */
  getZipContent(zipPath){
    return new Promise((resolve, reject)=>{

      if(debug)  console.log('getZipContent', zipPath);
      fs.createReadStream(zipPath).pipe(unzip.Parse()).on('entry', function (entry) {
        if (entry.path === "data.json") {
          var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
              initialSize: (100 * 1024),   // start at 100 kilobytes.
              incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
          });
          myWritableStreamBuffer.on('finish', () => {
            fs.unlink(zipPath, err => {
              if (err)
                reject(err);
              else
                resolve( JSON.parse(myWritableStreamBuffer.getContentsAsString()) )
            })
          })

          entry.pipe(myWritableStreamBuffer);
        } else {
          entry.autodrain();
        }
      });//createReadStream

    });

  }//getZipContent


  /**
   * [unpackCryptzip // unpack cryptzip and return data]
   * @param  {Object} cryptzip [file]
   * @return {Object}
   */
  unpackCryptzip(cryptzip){
    return new Promise(async (resolve, reject)=>{
      try {
        let zipPath = await this._saveFile(cryptzip);
        let data = await this.getZipContent(zipPath);

        fs.unlink(cryptzip.path, err => {
          if (err)
            reject(err);
          else
            resolve(data);
        });//unlink cryptzipped.path

      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }



}//class
module.exports = new Tracking();
