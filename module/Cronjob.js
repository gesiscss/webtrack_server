var tracking = require('./lib/Tracking.js');
var fs = require('fs');

var db  = require('./lib/Db');
var sd2p  = require('./StorageDestination2Project.js');
var cron2p = require('./Cronjob2Projekt');
var settings  = require('./Settings');

const trackingPage = require('./TrackingPage.js');

var storage = {
  aws: require('../module/Aws')
}
var S3Service  = require('../module/lib/aws/S3Service');
var cron = null;

class Cronjob {

  constructor() {
    this.storage = this.storage.bind(this);
    this.jobs = [];
    this.storageActive = false;
    this.setJobs = this.setJobs.bind(this);
    setTimeout(this.setJobs, 3000);
  }

  /**
   * [setJobs update jobs and update it // start the run function]
   */
  async setJobs(){

    if( db.init ) this.jobs = await cron2p.getList();
    setInterval(async () => {
      if( db.init ) this.jobs = await cron2p.getList();
    }, 10000)
    this.run(true);
  }

  /**
   * [run start the jobs]
   * @param  {Boolean} force [if the job has the state active of true than you can froce the job]
   */
  run(force=false){
    setTimeout(async ()=>{
      for (let job of this.jobs) {
        let active = force? force: !job.ACTIVE;
        if(job.ENABLE && active && this.hasOwnProperty(job.TYPE)){
          this[job.TYPE](job.PROJECT_ID, job.SECINTERVAL*1000, job).then(console.log).catch(console.log);
        }
      }
      this.run();
    }, 2000)
  }



  /**
   * [storage sync the storage]
   * @param  {Integer} project_id
   * @param  {Integer} timeout
   * @param  {Object} job
   * @return {Promise}
   */
  async storage(project_id, timeout, job=null){
    return new Promise(async (resolve, reject)=>{
      try {
          let settings = await cron2p.getSettings(project_id, 'storage');  //fetch settings

          if( db.init ){
              if(job!=null) job.ACTIVE = true;
              await cron2p.setActive(project_id, 'storage', true); //set cron to active

              setTimeout(async () => {
                try {
                  let settings = await cron2p.getSettings(project_id, 'storage');
                  if(settings.ENABLE && job!=null){
                    reject('Function not enable');
                  }

                  if(!this.storageActive){
                    this.storageActive = true
                    let [destination, id] = await sd2p.get(project_id);
                    let config = await storage[destination].get(id);
                    switch (destination) {
                      case 'aws':
                         await this.awsCron(project_id, config.FULLRIGTH_ACCESSKEYID, config.FULLRIGTH_SECRETACCESSKEY, config.BUCKET);
                        break;
                      default:
                      reject('Storage destination '+destination+' not found');
                    }//switch


                    await cron2p.setActive(project_id, 'storage', false);
                    if(job!=null) job.ACTIVE = false;
                    this.storageActive = false;
                    console.log('Storage is up to date!');
                    resolve(true);
                  }else{
                    reject('Cronjob already active');
                  }
                } catch (e) {
                  if(job!=null) job.ACTIVE = false;
                  if(await cron2p.isActive(project_id, 'storage')) await cron2p.setActive(project_id, 'storage', false);
                  reject(e)
                }
              }, timeout)//timeout

          }else{
            reject('No db connection');
          }
      } catch (err) {
        if(await cron2p.isActive(project_id, 'storage')) await cron2p.setActive(project_id, 'storage', false);
        reject(err);
      }
    });
  }


  /**
   * [awsCron fetch the data from aws]
   * @param  {Integer} projekt_id
   * @param  {String}  accessKeyId
   * @param  {String}  secretAccessKey
   * @param  {String}  bucket
   * @return {Promise} boolean
   */
  awsCron(projekt_id, accessKeyId, secretAccessKey, bucket){
    return new Promise(async (resolve, reject)=>{
      try {
        let s3 = new S3Service(accessKeyId, secretAccessKey, bucket);


        for (let key of await s3.listKeys()) {
          let object = await s3.getObject({Key: key});  //get object from aws s3
          let r = JSON.parse(object.Body.toString());  //get cryptet json
          let string = tracking.crypt.decrypt(r.cryptkeys, r.encrypted); // decrypt

          if(string.substring(0, 28)!=='data:application/zip;base64,') // check string if zip application
            reject('Fail to cut Faile');
          else{
            let dataString = string.substring(28, string.length-1);     //cut string
            let zipPath = '/tmp/'+tracking._getRandomString(15)+'.zip'; //create zip path
            fs.writeFileSync(zipPath, new Buffer(dataString, 'base64')); // write zip
            let data = await tracking.getZipContent(zipPath);  //get zip content as data
            await trackingPage.create(data.projectId, data.id, data.pages, data.versionType, true);
            await s3.deleteObject({Key: key}); // delete object from aws s3 bucket
          }
        }//for
        resolve(true);
      } catch (e) {
        reject(e)
      }
    });
  }


}

if(cron==null) cron = new Cronjob()

module.exports = cron;
