"use strict";
const striptags = require('striptags');
const sanitizeHtml = require('sanitize-html');
const DataTableClass = require('./sql/DataTableClass.js');

const urlRessource = require('./URLRessource.js');

class DataPage extends DataTableClass{


  /**
   * [get // return all HTML-Strings from page-ID]
   * @param  {Array} page_ids [e.g. [1,4,8]]
   * @param  {Integer} level [default: 2]
   * @return {Object}
   */
  get(page_ids=[], level=1){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.get(page_ids);
        let r = {};
        for (let i = 0; i < rows.length; i++) {

          if(!r.hasOwnProperty(rows[i].PAGE_ID)) r[rows[i].PAGE_ID] = {};
          r[rows[i].PAGE_ID][rows[i].PAGE_ID] = {createdate: new Date(rows[i].CREATEDATE)}

          switch (level) {
            case 1:
                r[rows[i].PAGE_ID][rows[i].PAGE_ID].text = sanitizeHtml(rows[i].HTML, { allowedTags: [] })
              break;
            case 2:
                r[rows[i].PAGE_ID][rows[i].PAGE_ID].html = await this.addHTMLContent(rows[i].PAGE_ID, rows[i].VERSION, rows[i].HTML)
              break;
            default:
          }//switch

        }//for i
        resolve(r);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [isVersion check the version-nummber of the Page]
   * @param  {Integer}  page_id
   * @param  {Integer}  version
   * @return {Boolean}
   */
  isVersion(page_id, version){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.isVersion(page_id, version);
        resolve(rows.length>0? true: false)
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getVersions return list of versions from page]
   * @param  {Integer} page_id
   * @return {Boolean}
   */
  getVersions(page_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.getVersions(page_id);
        resolve(rows.map(page => page.VERSION ))
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [addHTMLContent replace the source in the content]
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @param  {String} html
   * @return {Promise} html
   */
  addHTMLContent(page_id, version, html){
    return new Promise(async (resolve, reject)=>{
      try {
        let source = await urlRessource.get(page_id+'_'+version);
        for (let s of source) {
          try {
            html = html.replace(new RegExp(s.url, 'g'), s.data);
          } catch (e) {}
        }
        resolve(html)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * [getPageVersion delivers HTML-content from page]
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @return {Boolean/String}
   */
  getPageVersion(page_id, version){
    return new Promise(async (resolve, reject)=>{
      try {
        let rows = await super.getPageVersion(page_id, version);
        if(rows.length==0){
          resolve(false)
        }else{
          rows[0].HTML = sanitizeHtml(rows[0].HTML, { allowedTags: [] })
          resolve(rows[0].HTML);
        }
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [deletePage]
   * @param  {Integer} page_id [description]
   * @return {Promise}
   */
  deletePage(page_id){
    return new Promise(async (resolve, reject)=>{
      try {
        let versions = await this.getVersions(page_id);
        for (let version of versions){
          await this.delete(page_id, version);
        }
        await super.deletePage(page_id);
        resolve();
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * [add new entry]
   * @param {Integer} page_id    [description]
   * @param {Integer} version [description]
   * @param {String} html       [description]
   * @param {Array} source     [description]
   * @param {String} createdate [description]
   */
  add(page_id, version=1, html='', source=[], createdate){
    return new Promise(async (resolve, reject)=>{
      try {
        await super.add([[page_id, version, html, createdate]]);
        await urlRessource.create(page_id+'_'+version, source);
        resolve();
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * [delete page content of version from page]
   * @param  {Integer} page_id
   * @param  {Integer} version
   * @return {Promise}
   */
  delete(page_id, version){
    return new Promise(async (resolve, reject)=>{
      try {
        await super.delete(page_id, version);
        await urlRessource.delete(page_id+'_'+version);
        resolve();
      } catch (e) {
        reject(e);
      }
    })
  }



}//class

module.exports = new DataPage();
