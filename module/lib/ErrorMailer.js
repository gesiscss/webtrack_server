const Mailer = require('./Mailer');
var moment = require('moment');

class ErrorMailer extends Mailer{

  constructor(props) {
    super(props);
    // this.lastMail = +new Date();
    this.lastMail = -300*1000;
    this.interval = 300*1000;
    // this.interval = 5*1000
    this.content = [];
    this.subject = this.DEFAULT_SETTINGS.ErrorMailer.subject;
  }

  /**
   * [sendMail store the msg and send if new msg time older than the interval time after last msg]
   * @param  {String} text [default: '']
   * @return {Promise}
   */
  sendMail(text=''){
    return new Promise(async (resolve, reject) => {
      try {
        let now =+ new Date();
        this.content.push({time: now, text: text});

        if(this.lastMail+this.interval < now){
          this.lastMail = now;
          let msg = '';
          for (let m of this.content) {
            msg += '<br/>'+'Error on '+moment(m.time).format('YYYY-MM-DD HH:mm:ss');
            msg += '<br/>'+'----'
            msg += '<br/>'+m.text
          }
          msg = msg.replace(/(?:\r\n|\r|\n)/g, '<br>');
          this.content = [];
          // console.log(msg);
          let info = await super.sendMail({subject: this.subject, html: msg});
          console.log(info);
        }
        resolve()
      } catch (e) {
        reject(e)
      }
    });
  }




}//class

module.exports = new ErrorMailer();
