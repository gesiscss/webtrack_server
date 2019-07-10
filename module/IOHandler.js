"use strict";
var install = require('../module/Install.js');
var IO = require('../module/lib/IO.js');

function Hander() {

  var _handle = async (fn, req, res, next, err=null) => {
    try {
      let io = new IO(req, res);
      let isInstall = await install.is();
      let param = {needVerify: true, needAdminPermissions: false, redirect: true, callback: ()=>{} };


      switch (typeof fn) {
        case 'object':
          param = Object.assign({}, param, fn)
          break;
        case 'function':
          param = Object.assign({}, param, {callback: fn});
          break;
        default:
          throw new Error('Parameter error')
      }



      if(err!=null){
        io.resError(err)
      }else if(!isInstall && param.redirect){
        res.redirect('/');
      }else{
        let r = await io.handleReqAndRes(param.needVerify, param.needAdminPermissions);
        param.callback(r, io, next, isInstall)
      }
    } catch (e) {
      next(e)
    }
  }

  this.io = fn => (req, res, next) => {
    _handle(fn, req, res, next);
  }

  this.error = (err, req, res, next) => {

    _handle({}, req, res, next, err);
  }


}


module.exports = new Hander();
