const SubProcess = require('../module/lib/SubProcess');
const Download = require('../module/Download');
const download = new Download();
const subprocess = new SubProcess();
console.log = subprocess.log;


process.on('message', (args) => setTimeout(async () => {

    try {
      subprocess.log('process.pid', process.pid);
      const id = args.entry_id;
      subprocess.log('ID', id);
      if((await download.getCount(id)) <= download.getMAXCount()){
        await download.updateCount(id);
        let entry = await download.get(id);
        subprocess.log('ID', id, '"download.get"');
        let result = await download._start(id, entry.USER_ID, entry.PROJECT_ID, entry.FILTER_IDS, entry.LEVEL);
        subprocess.response({result: true});
        subprocess.close();
      }else{
        throw new Error('MAX_RUN_COUNT on download file '+id);
      }

    } catch (err) {
      try {
        console.log(err);
        await download.updateError(args.entry_id, err.hasOwnProperty('stack')? err.stack.toString(): err.toString())
        subprocess.close(true);
      } catch (e) {
        subprocess.response({error: e});
        subprocess.close(true);
      }
    }

}, 1000))
