const OPTIONS = {
  REGEX: 'Regex',
  CONTAINS: 'Contains',
  SLIDERNUMBER: 'SliderNumber',
  SLIDERDATE: 'SliderDate'
}

const MAX_RUN_COUNT = 3;
const PAGE_ATTR = ['ID', 'PRECURSOR_ID', 'PROJECT_ID', 'URL', 'TITLE', 'DURATION', 'STARTTIME', 'TYPEVERSION', 'EVENTS', 'DESCRIPTION', 'KEYWORDS', 'CONTENT'];

var filtergroup = require('../module/Filtergroup.js');
var filter = new (require('../module/Filter.js'))(filtergroup);
var dataPage = require('../module/DataPage.js');
var project = require('../module/Project.js');
var events2page = require('../module/Events2Page.js');
var DownloadTableClass = require('./sql/DownloadTableClass.js')
const Archive = require('./lib/Archive.js');



class Download extends DownloadTableClass{

  /**
   * [getMAXCount return const MAX_RUN_COUNT]
   * @return {[type]} [description]
   */
  getMAXCount(){
    return MAX_RUN_COUNT;
  }

  /**
   * [_filter run the filter and check the value]
   * @param  {Object} f
   * @param  {Unknown} value
   * @return {Boolean}
   */
  _filter(f, value){
    switch (f.TYPE) {
      case OPTIONS.CONTAINS:
          for (let toCompare of JSON.parse(f.VALUE)) {
            if(value.indexOf(toCompare)>=0) return true;
          }
          return false;
        break;
      case OPTIONS.REGEX:
          try {
            let flags = f.VALUE.replace(/.*\/([gimy]*)$/, '$1');
            let pattern = f.VALUE.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
            let regex = new RegExp(pattern, flags);
            return regex.test(value);
          } catch (e) {
            return false
          }
        break;
      case OPTIONS.SLIDERNUMBER:
          if(typeof f.VALUE === 'string') f.VALUE = JSON.parse(f.VALUE);
          return f.VALUE[0] <= value && value <= f.VALUE[1];
        break;
      case OPTIONS.SLIDERDATE:
          if(typeof f.VALUE === 'string') f.VALUE = JSON.parse(f.VALUE);
          return f.VALUE[0] <= value.getTime() && value.getTime() <= f.VALUE[1];
        break;

      default:

    }
    return false;
  }

  /**
   * [_filterPages filter the attributes of pages and return the filter object]
   * @param  {Array} filters
   * @param  {Object} client2pages
   * @param  {Object} page2content [data of pages]
   * @param  {Archive} archive
   * @return {Promise} Object
   */
  _filterPages(filters, client2pages, page2content, archive){
    return new Promise(async (resolve, reject) => {
      try {
        let toDel = {};

        for (let client_id in client2pages) {
          for (let index in client2pages[client_id]){
              let p = client2pages[client_id][index];


              for (let attr in p) {
                for (let f of filters) {
                  if(attr===f.COLUME){
                    if(!this._filter(f, p[attr])){
                      if(!toDel.hasOwnProperty(client_id)) toDel[client_id] = [];
                      if(!toDel[client_id].includes(index)) toDel[client_id].push(index);
                    }// if false
                  }//attr===f.COLUME
                }//for filters
              }//for page attr


              for (let version in page2content[p.ID]) {
                let v = page2content[p.ID][version];
                console.log('v.filename', v);
                if(v.hasOwnProperty('filename')){
                  let text = await archive.getAttachment(v.filename);

                  for (let f of filters) {
                    if('CONTENT'===f.COLUME){
                      if(!this._filter(f, text)){
                        if(!toDel.hasOwnProperty(client_id)) toDel[client_id] = [];
                        if(!toDel[client_id].includes(index)){
                          toDel[client_id].push(index);
                          console.log('delete', v.filename);
                          await archive.deleteAttachment(v.filename);
                        }
                      }
                    }
                  }//for filters
                }

              }//for html version



          }//for client pages
        }//for client

        for (let client_id in client2pages) {
          if(toDel.hasOwnProperty(client_id)){
            for (let index of toDel[client_id]) {
               if(client2pages[client_id].hasOwnProperty(index)){
                  delete client2pages[client_id][index];
               }else{
                 console.log('index ' + index + ' not found in ' +client_id);
               }
            }
            client2pages[client_id] = client2pages[client_id].filter(v=>v!==undefined || v!==null);
          }
          if(client2pages[client_id].length===0) delete client2pages[client_id]
        }

        resolve(client2pages);
      } catch (e) {
        console.log(e);
        reject(e);
      }

    });
  }

  /**
   * [_getClientsPages return object of pages from client_ids]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array} client_ids
   * @return {Promise} Object
   */
  _getClientsPages(user_id, project_id, client_ids){
    return new Promise(async (resolve, reject) => {
      try {
        let r = {};
        for (let client_id of client_ids) {
          r[client_id] = [];
          let data = await project.getClientPages(user_id, project_id, client_id);
          r[client_id] = r[client_id].concat(data);
        }
        resolve(r)
      } catch (e) {
        reject(e)
      }

    });
  }


  /**
   * [_fillArchive fill the archive with the pages]
   * @param  {Archive} archive
   * @param  {Array} page_ids
   * @param  {Number} level
   * @return {Promise}
   */
  _fillArchive(archive, page_ids, level){
    return new Promise(async (resolve, reject) => {
      try {
        let data = {};
        const chunkSize = 50;
        let count = 0;
        let chunks = [].concat.apply([], page_ids.map((elem,i) => i%chunkSize ? [] : [page_ids.slice(i,i+chunkSize)] ));

        for (let chunk of chunks) {
          let content = await dataPage.get(chunk, level);

          for (let id of Object.keys(content)) {
            count += 1;
            if(!data.hasOwnProperty(id)){
              data[id] = [];
            }
            let d = { createdate: content[id][id].createdate };
            if(content[id][id].hasOwnProperty('html')){
              d.filename = await archive.appendAttachment(content[id][id].html, 'UTF-8')
            }else if(content[id][id].hasOwnProperty('text')){
              d.filename = await archive.appendAttachment(content[id][id].text, 'UTF-8')
            }
            data[id].push(d);
          }
        }//for
        resolve(data);
      } catch (err) {
        reject(err)
      }
    });
  }


  /**
   * [_createResult create result for download file]
   * @param  {Object} clients
   * @param  {Object} client2pages
   * @param  {Object} page2content
   * @return {Promise} Object
   */
  _createResult(clients, client2pages, page2content){
    return new Promise(async (resolve, reject) => {
      try {
        let result = [];
        for (let client of clients) {
          let client_r = {name: client.CLIENT_HASH, pages: []};
          if(client2pages[client.ID]===undefined) continue;
          for (let page of client2pages[client.ID]) {
              page.EVENTS = [];
              //push Events
              for (let event of await events2page.get(page.ID)) {
                let r_event = {
                  type: event.TYPE,
                  timestamp: event.TIMESTAMP,
                  values: []
                };
                for (let v of event.values) {
                  r_event.values.push({
                    name: v.NAME,
                    value: v.VALUE
                  })
                }
                page.EVENTS.push(r_event)
              }

              let r_page = {}
              for (let attr in page) {
                if (PAGE_ATTR.includes(attr)) {
                  r_page[attr.toLowerCase()] = page[attr];
                }
              }
              if(page2content.hasOwnProperty(page.ID)){
                r_page.content = page2content[page.ID]
              }
              client_r.pages.push(r_page);
          }
          result.push(client_r)
        }//for
        resolve(result)
      } catch (err) {
        reject(err)
      }
    });
  }


  /**
   * [start start filter and return data of page]
   * @param  {Integer} entry_id
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Array} filter_ids   [default: []]
   * @param  {Integer} level      [Number of level to get text or html code]
   * @return {Promise} Array
   */
  _start(entry_id, user_id, project_id, filter_ids=[], level){
    return new Promise(async (resolve, reject) => {
      const archive = new Archive();
      try {
        let f = await filter.getAll(filter_ids);
        console.log('level', level);

        let clients = await project.getClients(user_id, project_id);
        let client2pages = await this._getClientsPages(user_id, project_id, clients.map(v=>v.ID));
        let page_ids = [];
        for (let client_id in client2pages){
          page_ids = page_ids.concat(client2pages[client_id].map(v=>v.ID)); //get all page ids
        }
        // page_ids = page_ids.slice(0, 2);

        let page2content = await this._fillArchive(archive, page_ids, level);
        client2pages = await this._filterPages(f, client2pages, page2content, archive);
        let result = await this._createResult(clients, client2pages, page2content);
        archive.appendFile(JSON.stringify(result), 'UTF-8', 'data.json')
        console.log('ID', entry_id, '"result finish"');
        let buf = await archive.createZip();
        console.log('ID', entry_id, '"create zip finish"');
        await this.updateFile(entry_id, buf);
        console.log('ID', entry_id, '"download.updateFile"');
        archive.clean();
        resolve()
      } catch (e) {
        console.log(e);
        archive.clean();
        reject(e)
      }
    });
  }

  /**
   * [get check the id and return the entry by id]
   * @param  {Integer} id
   * @return {Promise}
   */
  get(id){
    return new Promise(async (resolve, reject) => {
      try {
        if(await this.isId(id)){
          resolve((await super.get(id))[0])
        } else {
          throw new Error('Id '+id+' not found');
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [updateCount increase the count of entry is startet]
   * @param  {Integer} id
   * @return {Promise}
   */
  updateCount(id){
    return new Promise(async (resolve, reject) => {
      try {
        let count = await this.getCount(id);
        await this.setCount(id, count+1);
        resolve();
      } catch (e) {
        reject(e)
      }
    })
    return db.promiseQuery("UPDATE `"+this.table+"` SET `COUNT` = '"+count+"' WHERE `ID` = "+id+";");
  }

  /**
   * [getCount return count of entry is started]
   * @param  {Integer} id
   * @return {Promise}
   */
  getCount(id){
    return new Promise(async (resolve, reject) => {
      try {
        let count = (await super.getCount(id))[0].COUNT;
        resolve(parseInt(count, 10));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getList check permisson and return list of filtered entrys]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @return {Promise}
   */
  getList(user_id, project_id){
    return new Promise(async (resolve, reject) => {
      try {
        await project._checkPermission(user_id, project_id)
        resolve(await super.getList(project_id));
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [delete // check permisson from user and delete download entry]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @return {Promise}
   */
  delete(user_id, project_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        await project._checkPermission(user_id, project_id)
        resolve(await super.delete(id));
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [getFile // check permisson from user and return buffer file by id]
   * @param  {Integer} user_id
   * @param  {Integer} project_id
   * @param  {Integer} id
   * @return {Promise} Buffer
   */
  getFile(user_id, project_id, id){
    return new Promise(async (resolve, reject) => {
      try {
        await project._checkPermission(user_id, project_id)
        resolve((await super.getFile(id))[0].FILE);
      } catch (e) {
        reject(e)
      }
    })
  }



}

module.exports = Download;
