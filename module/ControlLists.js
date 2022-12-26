const db = require('./lib/Db.js');

var ControlListsTableClass = require('./sql/ControlListsTableClass.js')

class ControlLists extends ControlListsTableClass {

  queryURL(request) {
    return new Promise(async (resolve, reject) => {
      try {
        let url = request.body.domain;
        if (url.startsWith('www.')){
          url = url.slice(4);
        }
        //let rows = await db.promiseQuery("SELECT `list` FROM `controllist` WHERE clean_domain = '"+url+"'");
        let rows = await super.get(url);
        if (rows.length) {
          var result = rows[0].criteria;
        }
        resolve(result);
      } catch (e) {
          console.error(e);
          reject(e)
        }
    });
  }
};

module.exports = new ControlLists();
