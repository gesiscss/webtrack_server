const SubProcess = require('../module/lib/SubProcess');
const Page = require('../module/Page');
const subprocess = new SubProcess();
const page = new Page();
console.log = subprocess.log;

process.on('message', (args) => setTimeout(async () => {

    try {
      subprocess.log('PID:', process.pid, 'Project ID:', args.project_id, 'Client HASH:', args.client_hash);
      await page.create(args.project_id, args.client_id, args.client_hash, args.pages, args.versionType);
      subprocess.response({result: true});
      subprocess.close();
    } catch (err) {
      subprocess.response({error: err.stack})
      subprocess.close(true);
    }

}, 1000))
