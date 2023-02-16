const redis = require('redis');
const fs = require('fs');
const readline = require('readline');

class RedisLoader {
    constructor() {
        this.client = redis.createClient({db: 1});
    }

    loadControlList2Redis() {
        // create a readline interface to read the CSV file line by line
        const rl = readline.createInterface({
            input: fs.createReadStream('./data/controllist.csv'),
            crlfDelay: Infinity
        });
        // create a Redis transaction to store the data
        const multi = this.client.multi();
        // read each line of the CSV file and store the data in Redis
        rl.on('line', (line) => {
            if (line.startsWith('clean_domain,criteria')) {
                // skip the header row
                return;
            }
            const [column1, column2] = line.split(',');
            multi.set(column1, column2);
        });
        // execute the Redis transaction once all lines have been read
        rl.on('close', () => {
            multi.exec((err, replies) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`${replies.length} keys stored in Redis`);
                }
                this.client.quit();
            });
        });
    }


    checkIfEmpty() {
        this.client.keys('*', (err, keys) => {
            if (err) {
              console.error(err);
              this.client.quit();
            } else if (keys.length === 0) {
              console.log('Database is empty');
              this.loadControlList2Redis();
            } else {
              console.log(`Database has ${keys.length} keys`);
              this.client.quit();
            }
        });
    }

}

module.exports = new RedisLoader(); 