"use strict";
const trackingPage = require('../module/TrackingPage.js');

class Simulator {

  constructor() {
    this.zombies = 20;
  }

  async simulate(request){
      return new Promise((resolve, reject) => {
          try {
              let _start = +new Date();

              console.log('Sending first batch');
              this.send_batch(request);

              let interval = setInterval(function(){
                  console.log('Sending batch');
                  this.send_batch(request);

                  // 30 minutes, 3 requests pre minute
                  //if ( (+new Date()) - _start > 30 * 60 * 1000 ) {
                  if ( (+new Date()) - _start > 2 * 60 * 1000 ) {
                      clearInterval(interval);
                  }

              // every twenty seconds
              }.bind(this), 20000);
              resolve(true);
          } catch(e){
              reject(e)
          }
      });
  }

  send_batch(request){
      for (var i=1; i <= this.zombies; i++) {
          trackingPage.create(request.body.projectId, request.body.id, 
              request.body.pages, request.body.versionType);
      }
  }


}


module.exports = new Simulator();
