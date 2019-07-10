var express = require('express');
var router = express.Router();
var users = require('../module/users.js');
var schema = require('../schema/users.js');
var io = require('../module/IOHandler.js').io;


router.post('/getAll', schema.get('getAll'), io((r, io) => {
    users.getAll().then(io.res).catch(io.resError);
}));

router.post('/add', schema.get('add'), io({needAdminPermissions: true, callback: (r, io, next) => {
    users.add(r.body).then(io.res).catch(io.resError);
}}));

router.post('/del', schema.get('del'), io({needAdminPermissions: true, callback: (r, io, next) => {
    users.del(r.body.id).then(io.res).catch(io.resError);
}}));

router.post('/changePw', schema.get('changePw'), io({needAdminPermissions: true, callback: (r, io, next) => {
    users.changePw(r.body.id, r.body.pw).then(io.res).catch(io.resError);
}}));

router.post('/setEnable', schema.get('setEnable'), io({needAdminPermissions: true, callback: (r, io, next) => {
    users.setEnable(r.body.id, r.body.boolean).then(io.res).catch(io.resError);
}}));

router.post('/setAdmin', schema.get('setAdmin'), io({needAdminPermissions: true, callback: (r, io, next) => {
    users.setAdmin(r.body.id, r.body.boolean).then(io.res).catch(io.resError);
}}));

module.exports = router;
