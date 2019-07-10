var express = require('express');
var router = express.Router();
var filtergroup = require('../module/Filtergroup.js');
var filter = new (require('../module/Filter.js'))(filtergroup);
var schema = require('../schema/filter.js');
var io = require('../module/IOHandler.js').io;

router.post('/group/add', schema.get('group_add'), io((r, io) => {
    filtergroup.add(r.id, r.body.project_id, r.body.name).then(io.res).catch(io.resError);
}));

router.post('/group/delete', schema.get('group_delete'), io(async (r, io, next) => {
  try {
      await filter.removeGroup(r.id, r.body.id)
      filtergroup.remove(r.id, r.body.id).then(io.res).catch(io.resError)
  } catch (e) {
      next(e)
  }
}));

router.post('/group/change', schema.get('group_change'), io((r, io) => {
    filtergroup.change(r.id, r.body.id, r.body.name).then(io.res).catch(io.resError);
}));

router.post('/group/getAll', schema.get('group_getAll'), io((r, io) => {
    filtergroup.getAll(r.id).then(io.res).catch(io.resError);
}));

router.post('/add', schema.get('add'), io((r, io) => {
    filter.add(r.id, r.body.group_id, r.body.name, r.body.colume, r.body.type, r.body.value).then(io.res).catch(io.resError);
}));

router.post('/change', schema.get('change'), io((r, io) => {
    filter.change(r.id, r.body.id, r.body.name, r.body.colume, r.body.type, r.body.value).then(io.res).catch(io.resError);
}));

router.post('/delete', schema.get('delete'), io((r, io) => {
    filter.remove(r.id, r.body.id).then(io.res).catch(io.resError);
}));


module.exports = router;
