const Queue = require('bee-queue');
const Page = require('../Page');
var log = require('./log');

class SaveQueue {
  constructor() {
    this.queue = new Queue('saves');
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
