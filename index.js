// "use strict";
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const AUTO_REPLY_ADDRESS = process.env.GMAIL_USER;

// Nodemailerのトランスポーターを作成
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

function sendEmail(recipientEmails = [], subject, body) {
  const mailOptions = {
    from: '"KOSHI" <' + AUTO_REPLY_ADDRESS + '>',
    to: recipientEmails.join(', '),
    subject: subject,
    text: body,
    html: `<b>${body}</b>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Message sent: %s", info.messageId);
    }
  });
}

function manageInbox() {
  const imap = new Imap({
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { servername: 'imap.gmail.com' }
  });

  imap.on('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Recipient is ready for accepting');
      }
    });
  });

  function getEmail(start, number) {
    console.log(`Getting email from seq: ${start}:${start + number}`);
    const f = imap.seq.fetch(`${start}:${start + number}`, {
      bodies: '',
      struct: true
    });

    f.on('message', async function (msg, seqno) {
      const prefix = '#' + seqno;
      msg.on('body', async stream => {
        const parsed = await simpleParser(stream);

        const { from, to, subject, date, textAsHtml, text } = parsed;
        console.log("-------------------");
        console.log("Email No. %s", prefix);
        console.log({ from: from.value[0], to: to.value, subject, date, textAsHtml, text });
        console.log("-------------------");


        if (to.value[0].address === AUTO_REPLY_ADDRESS) {
          const getSubject = parsed.subject
          const subject = `Thank You for Your Inquiry, ${from.value[0].name}!`;
          const body = `※ This email is an automated response from our system.<br><br>`
              + `Dear ${from.value[0].name},<br><br>`
              + `Thank you for your inquiry to ${process.env.YOUR_NAME}.<br><br>`
              + `We have received your inquiry with the following details:<br>`
              + `Our team will respond to your inquiry within 3 business days. Thank you for your patience.<br><br>`
              + `━━━━━━□■□ Inquiry Details □■□━━━━━━<br>`
              + `Name: ${from.value[0].name}<br>`
              + `E-Mail: ${from.value[0].address}<br>`
              + `Inquiry: ${getSubject}<br>`
              + `━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br><br>`
              + `———————————————————————<br>`
              + `Sleep Late Lab<br>`
              + `Contact: ${process.env.YOUR_NAME}<br>`
              + `Business Hours: Weekdays 9:00 AM - 5:00 PM<br>`
              + `Email: ${AUTO_REPLY_ADDRESS}<br>`
              + `———————————————————————<br><br>`;
      
          sendEmail([from.value[0].address], subject, body);
          console.log("Auto-reply sent");
      }
      
        
        
      });
    });
  }

  imap.on('error', function (err) {
    console.log(`Error: ${err}`);
  });

  imap.on('end', function () {
    console.log('Connection ended');
  });

  let numberOfEmails = 0;
  imap.on('mail', number => {
    if (numberOfEmails == 0) {
      console.log(`Current number of emails in inbox: ${number}`);
      numberOfEmails = number;
    } else {
      getEmail(numberOfEmails + 1, number - 1);
      numberOfEmails += number;
      console.log(`Number of emails updated to ${numberOfEmails}`);
    }
  });

  imap.on('expunge', number => {
    if (number <= numberOfEmails) {
      console.log(`Email #${number} was deleted`);
      numberOfEmails -= 1;
      console.log(`Number of emails updated to ${numberOfEmails}`);
    }
  });

  imap.connect();
}

// メールを受信ボックスを監視する
manageInbox();

