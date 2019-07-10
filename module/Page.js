"use strict";
var client = require('../module/Client.js').client;
var moment = require('moment');
var minify = require('html-minifier').minify;
var dataPage = require('../module/DataPage.js');
var events2page = require('../module/Events2Page.js');

var PageTableClass = require('./sql/PageTableClass.js');

const CREATE_BACKUP = true;
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const PAGES_BACKUP_PATH = path.resolve('pages_backup');

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
   * [create Save from client-hash the page-content to the project]
   * @param  {String} client_hash
   * @param  {Array} pages
   * @param  {String} versionType [e.g. 'Chrome' || 'yx']
   * @param  {Integer} project_id
   * @return {Boolean}
   */
  create(project_id, client_hash, pages, versionType){
    return new Promise(async (resolve, reject)=>{
      try {
        let c = await client.create(client_hash, project_id);
        let pageId2dbId = {};
        for (let p of pages) {
          //save the pages in backup file
          if(CREATE_BACKUP){
            console.log('create backup');
            let fileName = [project_id, client_hash, moment().format('DD-MM-YY_HH-mm-ss'), crypto.createHash('md5').update(p.url).digest('hex')].join('_')+'.json';
            console.log('write backup %s', fileName);
            fs.writeFileSync(path.resolve(PAGES_BACKUP_PATH, fileName), Buffer.from(JSON.stringify({
              project_id: project_id,
              client_hash: client_hash,
              pages: [p],
              versionType: versionType
            })))
            // console.log(fileName);
          }
          let precursor_id = await this.getPrecursorId(c.ID, p.precursor_id);
          console.log('precursor_id %s', precursor_id);
          let insertId = (await super.create(project_id, c.ID, p.id, p.precursor_id, precursor_id, p.url, p.title, p.duration, p.start, p.meta.description, p.meta.keywords, versionType)).insertId;
          console.log('page id %s', insertId);
          // console.log('insertId', insertId);

          pageId2dbId[p.id] = insertId;
          let children = await this.hasPageClient_PrecursorId(c.ID, p.id);
          // console.log('hasPageClient_PrecursorId');
          await this.setPrecursorId(children, insertId);
          // console.log('setPrecursorId');

          console.log('events2page');
          for (let event of p.events) await events2page.add(insertId, event)


          for (let i in p.content) {
              console.log('replace data');
              try {
                console.log('minify');
                p.content[i].html = minify(p.content[i].html, {collapseWhitespace: true, removeComments: true})
              } catch (err) {
                console.log('Failed to minify html');
              } finally {
                console.log('dataPage add');
                await dataPage.add(insertId, parseInt(i, 10), p.content[i].html, p.source, moment(p.content[i].date).format('YYYY-MM-DD HH:mm:ss'));
              }

              //

          }//for

        }//for

        resolve();
      } catch (e) {
        if(e.toString().length>1000){
          console.log('Error Tracking import');
        }else{
          console.log(e);
        }
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
