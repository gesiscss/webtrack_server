var express = require('express');
var router = express.Router();
var schema = require('../schema/client.js');
var publicClient = require('../module/PublicClient.js');
var trackingPage = require('../module/TrackingPage.js');
var settings = require('../module/Settings.js');
var io = require('../module/IOHandler.js').io;

router.get('/getProjects', io({needVerify: false, callback: (r, io, next) => {
    publicClient.getProjects().then(io.res).catch(io.resError)
}}));


router.post('/checkid', schema.get('checkid'), io({needVerify: false, callback: (r, io, next) => {
    trackingPage.checkClientId2Project(r.body.client_hash, r.body.project_id, settings).then(io.res).catch(io.resError)
}}));


module.exports = router;
