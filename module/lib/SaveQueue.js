const Queue = require('bee-queue');
const Page = require('../Page');
var log = require('./log');

class SaveQueue {
  constructor() {
    this.queue = new Queue('saves', {
      prefix: 'bq',
      stallInterval: 5000,
      nearTermWindow: 1200000,
      delayedDebounce: 1000,
      redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        options: {}
      },
      isWorker: true,
      getEvents: true,
      sendEvents: true,
      storeJobs: true,
      ensureScripts: true,
      activateDelayedJobs: false,
      //do not keep jobs in memory!
      removeOnSuccess: true,
      removeOnFailure: true,
      redisScanCount: 100
    });
    let page = new Page();

    this.queue.process(async (job) => {
        //console.log(`Processing job: ${job.id} HASH: ${job.data.client_hash}`);

        let res = await page.create(
                        job.data.project_id, 
                        job.data.client_id, 
                        job.data.client_hash, 
                        job.data.pages, 
                        job.data.versionType)

        return res;

    });

    this.queue.on('error', (err) => {
      //console.log(`Redis error job: ${job.id} HASH: ${job.data.client_hash}`);
      log.error(err);
    });

    this.queue.on('failed', (job, err) => {
      //console.log(`Failed job: ${job.id} HASH: ${job.data.client_hash}`);
      log.error(err);
    });

    this.queue.on('succeeded', (job, result) => {
      //console.log(`Finished job: ${job.id} HASH: ${job.data.client_hash}`);
      log.msg(`Finished job: ${job.id} HASH: ${job.data.client_hash}`);
    });

  }

  add_page(page){
    let job = this.queue.createJob(page);
    job
      .timeout(120000)
      .retries(0)
      .save()
      .then((job) => {
        // job enqueued, job.id populated
        console.log(`Enqueued job: ${job.id} HASH: ${job.data.client_hash}`);
      })


    
  }

}

module.exports = new SaveQueue();
