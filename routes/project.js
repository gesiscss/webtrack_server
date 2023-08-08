var express = require('express');
var router = express.Router();
var project = require('../module/Project.js');
var schema = require('../schema/project.js');
var io = require('../module/IOHandler.js').io;

router.post('/add', schema.get('add'), io((r, io) => {
    console.log('test');
    project.add(r.id, r.body.name, r.body.description).then(io.res).catch(io.resError);
}));

router.post('/change', schema.get('change'), io((r, io) => {
    project.change(r.id, r.body.id, r.body.name, r.body.description).then(io.res).catch(io.resError);
}));

router.post('/getAll', schema.get('getAll'), io((r, io) => {
    project.getAll(r.id).then(io.res).catch(io.resError);
}));

router.post('/get', schema.get('is_id'), io((r, io) => {
    project.get(r.id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/hasAdminPermission', schema.get('is_id'), io((r, io) => {
    project.hasAdminPermission(r.id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/delete', schema.get('is_id'), io((r, io) => {
    project.delete(r.id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/getClients', schema.get('is_id'), io((r, io) => {
    project.getClients(r.id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/getClientPages', schema.get('getClientPages'), io((r, io) => {
    project.getClientPages(r.id, r.body.id, r.body.client_id).then(io.res).catch(io.resError);
}));

router.post('/getPageEvents', schema.get('getPageVersions'), io((r, io) => {
    project.getPageEvents(r.id, r.body.id, r.body.page_id).then(io.res).catch(io.resError);
}));

router.post('/deletePageEvent', schema.get('deletePageEvent'), io((r, io) => {
    project.deletePageEvent(r.id, r.body.id, r.body.page_id, r.body.event_id).then(io.res).catch(io.resError);
}));

router.post('/getPageVersions', schema.get('getPageVersions'), io((r, io) => {
    project.getPageVersions(r.id, r.body.id, r.body.page_id).then(io.res).catch(io.resError);
}));

router.post('/deletePage', schema.get('deletePage'), io((r, io) => {
    project.deletePage(r.id, r.body.id, r.body.page_ids).then(io.res).catch(io.resError);
}));

router.post('/getPageContent', schema.get('pageContentParameter'), io((r, io) => {
    project.getPageContent(r.id, r.body.id, r.body.page_id, r.body.version).then(io.res).catch(io.resError);
}));

router.post('/deletePageContent', schema.get('pageContentParameter'), io((r, io) => {
    project.deletePageContent(r.id, r.body.id, r.body.page_id, r.body.version).then(io.res).catch(io.resError);
}));

router.post('/getPermissions', schema.get('is_id'), io((r, io) => {
    project.getPermissions(r.id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/addUserPermission', schema.get('permissionParameter'), io((r, io) => {
    project.addUserPermission(r.id, r.body.id, r.body.user_id).then(io.res).catch(io.resError);
}));

router.post('/deleteUserPermission', schema.get('permissionParameter'), io((r, io) => {
    project.deleteUserPermission(r.id, r.body.id, r.body.user_id).then(io.res).catch(io.resError);
}));

router.post('/changeUserPermission', schema.get('permissionParameter'), io((r, io) => {
    project.changeUserPermission(r.id, r.body.id, r.body.user_id, r.body.boolean).then(io.res).catch(io.resError);
}));

router.post('/getColumns', schema.get('getColumns'), io((r, io) => {
    project.getColumns(r.id, r.body.project_id).then(io.res).catch(io.resError);
}));

router.post('/client/get', schema.get('client_get'), io((r, io) => {
    project.getListOfClient2Project(r.id, r.body.id, r.body.range, r.body.sorted, r.body.filtered).then(io.res).catch(io.resError);
}));

router.post('/client/getCount', schema.get('client_getCount'), io((r, io) => {
    project.getCountofClient2Project(r.id, r.body.id).then(io.res).catch(io.resError);
}));

router.post('/client/create', schema.get('client_create'), io((r, io) => {
    project.createClient2Project(r.id, r.body.id, r.body.list).then(io.res).catch(io.resError);
}));

router.post('/client/delete', schema.get('client_delete'), io((r, io) => {
    project.deleteClient2Project(r.id, r.body.id, r.body.client_id, r.body.onlyLink).then(io.res).catch(io.resError);
}));

router.post('/client/change', schema.get('client_change'), io((r, io) => {
    project.changeClient(r.id, r.body.id, r.body.client_id, r.body.name).then(io.res).catch(io.resError);
}));

router.post('/client/clean', schema.get('client_clean'), io((r, io) => {
    project.cleanClient(r.id, r.body.id).then(io.res).catch(io.resError);
}));


module.exports = router;
