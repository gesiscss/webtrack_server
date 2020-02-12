const celery = require('node-celery');


function myecho() {
    console.log('echo');
  // Get all the emails
  // Send emails with your provider
}

class Celery {
  constructor() {
    this.client = celery.createClient({
            CELERY_BROKER_URL: 'amqp://guest:guest@localhost:5672//',
            CELERY_RESULT_BACKEND: 'amqp://'
        });

    console.log('test');
     
    this.client.on('error', function(err) {
        console.log(err);
    });
     
    this.client.on('connect', function() {
        console.log('connect');
        this.client.call('tasks.echo', ['Hello World!'], function(result) {
            console.log('end');
            console.log(result);
        });
    }.bind(this));
  }

  queue(page){
    console.log('queue');

    this.client.call('myecho', ['Hello World!']);
    
  }

}

module.exports = new Celery();
