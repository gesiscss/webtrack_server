"use strict";
var Client = require('../module/Client.js').Class
var project = require('../module/Project.js');
var schedule = require('../module/Schedule.js');
var settings = require('../module/Settings.js');
var urllist = require('../module/Urllist.js');
const log = require('./lib/log');


var extensionsfilter = {
  "js":     ['js'],
  "css":    ['css'],
  "img":    ['png', 'jpg', 'gif', 'svg', 'ico', 'bmp', 'gif', 'tif', 'eps'],
  "video":  ['mp4', 'wav', 'm4v', 'mov', 'mpg', 'wmv'],
  "music":  ['mp3', 'wav', 'mpa', 'm4a', 'aif']
}

class PublicClient extends Client{


  /**
   * [getProjects delivers all Project settings for client]
   * @return {Array}
   */
  getProjects(request=null){
    return new Promise(async (resolve, reject) => {
      try {
        if(request){
          if (request.body){
            log.msg('getProjects: ', request.body.client_hash)
          }
        }

        let projects = await project.getAktiv();
        if(projects.length==0)
          resolve([]);
        else{
          var result = [];
          let urlLists = await urllist._getListforProject(projects.map(e => e.ID));
          for (let project of projects) {

            project.SCHEDULE = project.SCHEDULE? await schedule.fetch(project.ID) : false;
            if(Object.keys(project.SCHEDULE).length==0) project.SCHEDULE = false;

            project.SETTINGS = await settings.fetch(project.ID);
            project.URLLIST = urlLists[project.ID];

            if(project.SETTINGS.EXTENSIONSFILTER.hasOwnProperty('all') && project.SETTINGS.EXTENSIONSFILTER.all === true){
                project.SETTINGS.EXTENSIONSFILTER = ['ALL'];
            }else{
                let extensions = [];
                for (let name in project.SETTINGS.EXTENSIONSFILTER) {
                  if(project.SETTINGS.EXTENSIONSFILTER[name]===true){
                    extensions = extensions.concat(extensionsfilter[name]);
                  }
                }
                project.SETTINGS.EXTENSIONSFILTER = extensions;
            }

            result.push(project);
          }//for
          // console.log(result);
          resolve(result)
        }
      } catch (e) {
        console.error(e);
        reject(e)
      }
    });
  }

  /**
   * [startInstalllation just writes in the log that an installation started]
   * @return {Array}
   */
  startInstallation(){
    return new Promise(async (resolve, reject) => {
      resolve(true);
    });
  }


  /**
   * [endInstallation just writes in the log that an installation ended]
   * @return {Array}
   */
  endInstallation(){
    return new Promise(async (resolve, reject) => {
      resolve(true);
    });
  }


};



module.exports = new PublicClient();
