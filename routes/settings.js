var express = require('express');
var router = express.Router();
var settings = require('../module/Settings.js');
var schema = require('../schema/settings.js');
var io = require('../module/IOHandler.js').io;

router.post('/changeBoolean', schema.get('changeBoolean'), io((r, io) => {
    settings.changeBoolean(r.id, r.body.project_id, r.body.id, r.body.boolean).then(io.res).catch(io.resError);
}));

router.post('/changeValue', schema.get('changeValue'), io((r, io) => {
    settings.changeValue(r.id, r.body.project_id, r.body.id, r.body.value).then(io.res).catch(io.resError);
}));

router.post('/get', schema.get('get'), io((r, io) => {
    settings.get(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));


module.exports = router;
