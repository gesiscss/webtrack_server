var express = require('express');
var router = express.Router();
var path = require('path');
var install = require('../module/Install.js');
var io = require('../module/IOHandler.js').io;


/* GET home page. */
router.get('/', io({needVerify: false, redirect: false, callback: (r, io, next, isInstall) => {
    if(!isInstall)
      io.response.redirect('a/#/install');
    else
      io.response.redirect('/a');
}}));

module.exports = router;
