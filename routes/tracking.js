const express = require('express');
const router = express.Router();

const trackingPage = require('../module/TrackingPage.js');

const OpenSSLHandler = require('../module/lib/OpenSSLHandler');
const clientCertHandler = new OpenSSLHandler();
const io = require('../module/IOHandler.js').io;


router.get('/cert', (req, res, next) => {
  res.sendFile(clientCertHandler.ssl.cert);
});

router.post ( '/upload', io({needVerify: false, callback: async (r, io, next) => {
  trackingPage.create(r.body.projectId, r.body.id, 
    r.body.pages, r.body.versionType).then(io.res).catch(io.resError)
}}));


module.exports = router;
