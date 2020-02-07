const express = require('express');
const router = express.Router();

const trackingPage = require('../module/TrackingPage.js');
const simulator = require('../module/Simulator.js');


const OpenSSLHandler = require('../module/lib/OpenSSLHandler');
const clientCertHandler = new OpenSSLHandler();
const io = require('../module/IOHandler.js').io;


router.get('/cert', (req, res, next) => {
  res.sendFile(clientCertHandler.ssl.cert);
});

router.post ( '/upload', io({needVerify: false, callback: async (r, io, next) => {
  // if it is in memory, be optimistic, and assume that it will succeed,
  // do not let the browser waiting. If it fails, there is nothing the client
  // can do anyway
  io.res();

  // uncomment to test high demand of requests, check the Simulator to
  // adjust values
  //simulator.simulate(r);

  // now call the promise
  trackingPage.create(r.body.projectId, r.body.id, 
    r.body.pages, r.body.versionType)
}}));


module.exports = router;
