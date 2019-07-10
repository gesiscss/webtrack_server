const fs = require('fs');
const archiver = require('archiver');
const rimraf = require('rimraf');
const path = require('path');
const moment = require('moment');

const ARCHIVE_PATH = path.resolve(__dirname, '..', '..', 'archive');
const ATTACHMENT_NAME = 'attachment';
const DATA_FOLDER_NAME = 'data';
const ZIP_FILE_NAME = 'data.zip';


class Archive {

  constructor(name=this.makeid()) {
    this.name = name;
    this.FOLDER_PATH = path.resolve(ARCHIVE_PATH, name);
    this.DATA_FOLDER = path.resolve(this.FOLDER_PATH, DATA_FOLDER_NAME);
    this.ATTACHMENT_PATH = path.resolve(this.DATA_FOLDER, ATTACHMENT_NAME);
    this.ZIP_FILE =  path.resolve(this.FOLDER_PATH, ZIP_FILE_NAME);
    console.log('this.FOLDER_PATH', this.FOLDER_PATH);
    console.log('this.FOLDER_PATH', this.DATA_FOLDER);
    console.log('this.ATTACHMENT_PATH', this.ATTACHMENT_PATH);
    if (!fs.existsSync(this.FOLDER_PATH)) fs.mkdirSync(this.FOLDER_PATH);
    if (!fs.existsSync(this.DATA_FOLDER)) fs.mkdirSync(this.DATA_FOLDER);
    if (!fs.existsSync(this.ATTACHMENT_PATH)) fs.mkdirSync(this.ATTACHMENT_PATH);
    this.files = []
  }

  /**
   * [clean delete the content folder]
   * @return {Promise}
   */
  clean(){
    rimraf.sync(this.FOLDER_PATH);
  }

  /**
   * [appendFile add one file to the attachment folder]
   * @param  {String/Buffer/TypedArray/Dataview} data
   * @param  {Unknown} [option=null] [encoding, mode, flag]
   * @param  {Name} [name=this.makeid()] [default: random string]
   * @return {Promise} name
   */
  appendAttachment(data, option=null, name=this.makeid()){
    return this.appendFile(data, option, name, this.ATTACHMENT_PATH)
  }

  /**
   * [getFile return the data of file from the attachment folder]
   * @param  {String} name
   * @return {Promise} data
   */
  getAttachment(name){
    return this.getFile(name, this.ATTACHMENT_PATH)
  }

  /**
   * [deleteFile delete file from folder]
   * @param  {String} name
   * @return {Promise}
   */
  deleteAttachment(name){
    return this.deleteFile(name, this.ATTACHMENT_PATH)
  }

   /**
    * [appendFile add file to the folder]
    * @param  {String/Buffer/TypedArray/Dataview} data
    * @param  {Unknown} [option=null] [encoding, mode, flag]
    * @param  {Name} [name=this.makeid()] [default: random string]
    * @param  {String} [folderPath=this.DATA_FOLDER] [path to the folder]
    * @return {Promise}
    */
  appendFile(data, option=null, name=this.makeid(), folderPath=this.DATA_FOLDER){
    return new Promise((resolve, reject) => {
      const file = path.resolve(folderPath, name);
      if(!this.files.includes(file)){
        this.files.push(file)
        fs.writeFileSync(file, data);
        resolve(name);
      }else{
        reject('File already exist');
      }
    })
  }

  /**
   * [getFile return the data of file]
   * @param  {String} name
   * @param  {String} [folderPath=this.DATA_FOLDER] [path to the folder]
   * @return {Promise} data
   */
  getFile(name, folderPath=this.DATA_FOLDER){
    return new Promise((resolve, reject) => {
      const file = path.resolve(folderPath, name);
      if(this.files.includes(file)){
        let data = fs.readFileSync(file);
        resolve(data);
      }else{
        reject('File not exist');
      }
    })
  }

  /**
   * [deleteFile delete file from folder]
   * @param  {String} name
   * @param  {String} [folderPath=this.DATA_FOLDER] [path to the folder]
   * @return {Promise}
   */
  deleteFile(name, folderPath=this.DATA_FOLDER){
    return new Promise((resolve, reject) => {
      const file = path.resolve(folderPath, name);
      if(this.files.includes(file)){
        fs.unlinkSync(file);
        resolve();
      }else{
        reject('File not exist');
      }
    })
  }

  /**
   * [makeid return random number]
   * @param  {Number} [length=10]
   * @return {String}
   */
  makeid(length=10) {
    let text = "";
    let possible = "0123456789";
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  /**
   * [createZip create zip archive from data folder]
   * @return {Promise} Buffer
   */
  createZip(){
    return new Promise((resolve, reject) => {
      try {
        const output = fs.createWriteStream(this.ZIP_FILE);
        const archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
        });
        output.on('close', () => {
          resolve(fs.readFileSync(this.ZIP_FILE));
        });
        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            // log warning
          } else {
            // throw error
            reject(err)
          }
        });
        archive.on('error', (err) => {
          reject(err)
        });
        // pipe archive data to the file
        archive.pipe(output);
        archive.directory(this.DATA_FOLDER, false);
        archive.finalize();

      } catch (err) {
        reject(err)
      }
    });
  }

}//class


module.exports = Archive;
