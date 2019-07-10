var express = require('express');
var router = express.Router();
var users = require('../module/users.js');
var schema = require('../schema/api.js');
var tokenHandler = require('../module/lib/tokenHandler.js');
var install = require('../module/Install.js');
var io = require('../module/IOHandler.js').io;


router.post('/login', schema.get('login'), io({needVerify: false, callback: async (r, io, next) => {
      try {
        let user = await users.check(r.body.username, r.body.password);
        let data = await tokenHandler.sign(user);
        io.authData = data.authData
        io.res({token: data.token});
      } catch (e) {
        next(e)
      }
}}));


router.post('/install', schema.get('install'), io({needVerify: false, redirect: false, callback: (r, io, next, isInstall) => {
      if(isInstall)
        io.resError('Already installed');
      else
        install.create(r.body).then(r => {
          io.authData = r.authData
          io.res({token: r.token});
        }).catch(io.resError);
}}));


module.exports = router;
