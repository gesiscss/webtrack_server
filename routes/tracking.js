const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const trackingPage = require('../module/TrackingPage.js');

const OpenSSLHandler = require('../module/lib/OpenSSLHandler');
const clientCertHandler = new OpenSSLHandler();
const io = require('../module/IOHandler.js').io;


router.get('/cert', (req, res, next) => {
  res.sendFile(clientCertHandler.ssl.cert);
});


router.post('/upload', io({needVerify: false, callback: async (r, io, next) => {
  new formidable.IncomingForm().parse(io.request, async (err, fields, files) => {
    try {
      // console.log(io.request);
      if(Object.keys(files).length==0){
        throw new Error('No files send');
      }else{
        for (let name in files) {
          if (files[name].type!='application/json') {
            throw new Error('Faile type is not application/json');
          }else{
            let str = fs.readFileSync(files[name].path, 'UTF-8');
            if(str.substring(0, 1) !== '{' && str.substring(str.length-1, str.length) !== '}'){
              throw new Error('Faile '+name+' is no JSON');
            }else{
              let data = JSON.parse(str);
              let r = await trackingPage.create(data.projectId, data.id, data.pages, data.versionType);
              // throw new Error('test2')
            }
          }
        }//for
        io.res();
      }
    } catch (err) {
      io.resError(err);
    }
  });//form
}}));


module.exports = router;
