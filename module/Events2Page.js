"use strict";
const Core = require('./lib/Core.js');
const Events2Page = require('./sql/Events2Page.js');
const Events2Data = require('./sql/Events2Data.js');


class Events2PageService extends Core{

  constructor() {
    super();
    this.event2page = new Events2Page();
    this.events2data = new Events2Data();
  }

  /**
   * [add // add event in db]
   * @param {Integer} page_id
   * @param {Promise} Object event
   */
  add(page_id, event){
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await this.event2page.add(page_id, event.event, event.timestamp);
        await this.events2data.add(rows.insertId, event.values);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * [get return list of events from page_id]
   * @param {Integer} page_id
   * @return {Promise} Array events
   */
  get(page_id){
    return new Promise(async (resolve, reject) => {
      try {
        let events = await this.event2page.get(page_id);
        for (let e of events) {
          e.values = await this.events2data.get(e.ID);
        }
        resolve(events);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * [getCount return count of events from page_ids]
   * @param {Array} page_id
   * @return {Promise} Object
   */
  getCounts(page_ids){
    return this.event2page.getCounts(page_ids);
  }

  /**
   * [remove delete all events from page_id]
   * @param {Integer} page_id
   * @return {Promise} Boolean
   */
  remove(page_id){
    return new Promise(async (resolve, reject) => {
      try {
        let ids = await this.event2page.getIds(page_id);
        if(ids.length>0){
          await this.events2data.remove(ids);
          await this.event2page.remove(ids);
        }
        resolve(true);
      } catch (e) {
        reject(e)
      }
    });
  }


  /**
   * [removeEvent remove event from page_id]
   * @param {Integer} page_id
   * @param  {Integer} event_id
   * @return {Promise} Boolean
   */
  removeEvent(page_id, event_id){
    return new Promise(async (resolve, reject) => {
      try {
        let ids = await this.event2page.getIds(page_id);
        if(ids.includes(event_id)){
          await this.events2data.remove([event_id]);
          await this.event2page.remove([event_id]);
        }else{
          throw new Error('event_id is not found');
        }
        resolve(true);
      } catch (e) {
        reject(e)
      }
    });
  }


}//class

module.exports = new Events2PageService();
