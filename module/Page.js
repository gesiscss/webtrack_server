"use strict";
var client = require('../module/Client.js').client;
var moment = require('moment');
var minify = require('html-minifier').minify;
var dataPage = require('../module/DataPage.js');
var events2page = require('../module/Events2Page.js');

var PageTableClass = require('./sql/PageTableClass.js');

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const PAGES_BACKUP_PATH = path.resolve('storage', 'json');
const HTML_BACKUP_PATH = path.resolve('storage', 'html');
const ERROR_BACKUP_PATH = path.resolve('storage', 'error');


class Page extends PageTableClass{

  /**
   * [check the page_id]
   * @param  {Integer} id
   * @return {Boolean/Integer}
   */
  check(id){
    return new Promise(async (resolve, reject)=>{
      try {
        let count = await this.isId(id);
        if(typeof count === 'boolean' && !count){
          reject('Id was not found in this table '+this.table);
        }else{
          resolve(count);
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getPrecursorId return the id from predecessor id]
   * @param  {Integer} client_id
   * @param  {String} precursor_id
   * @return {Integer} ID
   */
  getPrecursorId(client_id, precursor_id){
    return new Promise(async (resolve, reject)=>{
      try {
        if(precursor_id==null) precursor_id = 0;
        let rows = await super.getPrecursorId(client_id, precursor_id);
        resolve(rows.length>0 && rows[0].ID? parseInt(rows[0].ID, 10) : 0);
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * [setPrecursorId change all precursorId]
   * @param {Array} ids [default: []]
   */
  setPrecursorId(ids=[], precursorId){
    return new Promise(async (resolve, reject)=>{
      try {
        if(ids.length===0){
          resolve();
        }else{
          await super.setPrecursorId(ids, precursorId);
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [hasPageClient_PrecursorId provides all children pages that are dependent on the parents pages]
   * @param  {Integer}  client_id
   * @param  {Integer}  client_page_id
   * @return {Array}
   */
  hasPageClient_PrecursorId(client_id, client_page_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.hasPageClient_PrecursorId(client_id, client_page_id);
        resolve(rows.map(v=>v.ID));
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getChildren return ids from pages with the same precursorId]
   * @param  {Integer} id
   * @return {Array}
   */
  getChildren(id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this.check(id);
        let rows = await super.getChildren(id);
        resolve(rows.map(v=>v.ID));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [create Save from client-id the page-content to the project]
   * @param  {Integer} client_id
   * @param  {Array} pages
   * @param  {String} versionType [e.g. 'Chrome' || 'yx']
   * @param  {Integer} project_id
   * @return {Boolean}
   */
  create(project_id, client_id, client_hash, pages, versionType){
    return new Promise(async (resolve, reject)=>{
      try {
        let pageId2dbId = {};
        for (let p of pages) {

          /////////////////
          // WRITE TO DB //
          /////////////////
          //let precursor_id = await this.getPrecursorId(client_id, p.precursor_id);
          let insertId = (await super.create(project_id, client_id, p.id, p.precursor_id, -1, //precursor_id, 
            p.hostname, '', p.elapsed, p.start, '', '', versionType)).insertId;
          pageId2dbId[p.id] = insertId;

          //let children = await this.hasPageClient_PrecursorId(client_id, p.id);
          //await this.setPrecursorId(children, insertId);

          for (let event of p.events) await events2page.add(insertId, event)

          ////////////////
          // WRITE HTML //
          ////////////////
          let content = p.content;
          let filenames = [];
          let filenames_create = [];

          for (let i in content) {
            let fileName = insertId + '.html';
            if (i > 0) {
              // @tico: this is probably no longer necessary, idk why content is a list. I am
              // just leaving it in case there is something I haven't seen. Afaik, only one version
              // of the HTML is stored, it could be a previous version
              fileName = insertId + '_v' + i + '.html';
            }
            filenames.push(fileName);
            filenames_create.push(content[i].create);
            console.log('logging works wokrs');
            try {
              var t0 = Date.now();
              content[i].html = minify(content[i].html, {collapseWhitespace: true, removeComments: true})
              var t1 = Date.now();
              console.log("\nCall minify took " + (t1 - t0) + " milliseconds.");

            } catch (err) {
              console.log('Failed to minify html');
            } finally {
              var t0 = Date.now();
              fs.writeFileSync(path.resolve(HTML_BACKUP_PATH, fileName), Buffer.from(content[i].html))
              var t1 = Date.now();
              console.log("\nCall write took " + (t1 - t0) + " milliseconds.");
              //await dataPage.add(insertId, parseInt(i, 10), content[i].html, p.source, moment(content[i].date).format('YYYY-MM-DD HH:mm:ss'));
            }

          }

          ////////////////
          // WRITE JSON //
          ////////////////
          let fileName = insertId + '.json';

          // the content is stored separatedly as plain HTMLs
          p.content = filenames;
          p['content_create'] = filenames_create

          fs.writeFileSync(path.resolve(PAGES_BACKUP_PATH, fileName), Buffer.from(JSON.stringify({
            project_id: project_id,
            client_hash: client_hash,
            page: p,
            versionType: versionType
          })))

          p.content = content;

        }//for

        resolve();
      } catch (e) {
        if(e.toString().length>1000){
          console.log('Error Tracking import');
        }else{
          console.log(e);
        }


        ////////////////////////
        // WRITE FULL CONTENT //
        ////////////////////////

        //save the pages in backup file if something goes wrong storing in the database. 
        // TODO: If the database is down, then nothing is stored
        let fileName = [project_id, client_hash, moment().format('DD-MM-YY_HH-mm-ss'), '.json'].join('_');
        console.log('write error backup file: %s', fileName);
        fs.writeFileSync(path.resolve(ERROR_BACKUP_PATH, fileName), Buffer.from(JSON.stringify({
          pages: project_id,
          client_hash: client_hash,
          pages: pages,
          versionType: versionType
        })))
        
        reject(e)
      }
    });
  }//()

  /**
   * [getClientPages return list of client-pages]
   * @param  {Integer} project_id
   * @param  {Integer} client_id
   * @return {Array}
   */
  getClientPages(project_id, client_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.getClientPages(project_id, client_id);
        let counts = await events2page.getCounts(rows.map(e => e.ID));
        for (let page of rows) {
          page.countEvents = counts.hasOwnProperty(page.ID.toString())? counts[page.ID]: 0;
        }
        resolve(rows)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * [get return all page content]
   * @param  {Integer} id
   * @return {Object}
   */
  get(id){
    return new Promise(async (resolve, reject)=>{
      try {
        await this.check(id);
        let rows = await super.get(id);
        resolve(rows[0]);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * [_getClientIds2Project return list of all involved clients to the project]
   * @param  {Integer} project_id
   * @return {Array}
   */
  _getClientIds2Project(project_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super._getClientIds2Project(project_id);
        resolve(rows.map(e =>e.CLIENT_ID))
      } catch (e) {
        reject(e)
      }
    });
  }

}//class


module.exports = Page;
