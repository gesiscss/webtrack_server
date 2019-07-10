var express = require('express');
var router = express.Router();
var urllist = require('../module/Urllist.js');
var settings = require('../module/Settings.js');
var schedule = require('../module/Schedule.js');
var schema = require('../schema/settings.js');
var io = require('../module/IOHandler.js').io;

router.post('/changeBoolean', schema.get('changeBoolean'), io((r, io) => {
    settings.changeBoolean(r.id, r.body.project_id, r.body.id, r.body.boolean).then(io.res).catch(io.resError);
}));

router.post('/changeValue', schema.get('changeValue'), io((r, io) => {
    settings.changeValue(r.id, r.body.project_id, r.body.id, r.body.value).then(io.res).catch(io.resError);
}));

router.post('/storage/set', schema.get('storage_set'), io((r, io) => {
    settings.storage_set(r.id, r.body.project_id, r.body.destination, r.body.credentials).then(io.res).catch(io.resError);
}));

router.post('/storage/get', schema.get('storage'), io((r, io) => {
    settings.storage_get(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/storage/remove', schema.get('storage'), io((r, io) => {
    settings.storage_remove(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/storage/change', schema.get('storage_change'), io((r, io) => {
    settings.storage_change(r.id, r.body.project_id, r.body.settings).then(io.res).catch(io.resError);
}));

router.post('/get', schema.get('get'), io((r, io) => {
    settings.get(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/urllist/get', schema.get('urllist_get'), io((r, io) => {
    urllist.get(r.id, r.body.project_id, r.body.range, r.body.sorted, r.body.filtered).then(io.res).catch(io.resError);
}));

router.post('/urllist/add', schema.get('urllist_add'), io((r, io) => {
    urllist.add(r.id, r.body.project_id, r.body.url).then(io.res).catch(io.resError);
}));

router.post('/urllist/change', schema.get('urllist_change'), io((r, io) => {
    urllist.change(r.id, r.body.project_id, r.body.id, r.body.url).then(io.res).catch(io.resError);
}));

router.post('/urllist/delete', schema.get('urllist_delete'), io((r, io) => {
    urllist.delete(r.id, r.body.project_id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/urllist/getCount', schema.get('urllist_is_project_id'), io((r, io) => {
    urllist.getCount(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/urllist/clean', schema.get('urllist_is_project_id'), io((r, io) => {
    urllist.clean(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/schedule/get', schema.get('schedule_is_project_id'), io((r, io) => {
    schedule.get(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/schedule/set', schema.get('schedule_set'), io((r, io) => {
   schedule.set(r.id, r.body.project_id, r.body.options).then(io.res).catch(io.resError);
}));

router.post('/schedule/remove', schema.get('schedule_is_project_id'), io((r, io) => {
    schedule.remove(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));


module.exports = router;
