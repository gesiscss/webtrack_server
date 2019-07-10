const SubProcess = require('../module/lib/SubProcess');
const Page = require('../module/Page');
const subprocess = new SubProcess();
const page = new Page();
console.log = subprocess.log;

process.on('message', (args) => setTimeout(async () => {

    try {
      subprocess.log(process.pid, 'fetch args');
      subprocess.log(Object.keys(args));
      subprocess.log(process.pid, 'start save data');
      await page.create(args.project_id, args.client_hash, args.pages, args.versionType);
      subprocess.log(process.pid, 'finish');
      subprocess.response({result: true});
      subprocess.close();
    } catch (err) {
      subprocess.response({error: err.stack})
      subprocess.close(true);
    }

}, 1000))
