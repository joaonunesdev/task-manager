const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = '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';

sgMail.setApiKey(sendgridAPIKey);

const msg = { 
    to: 'lockenunes@gmail.com', 
    from: 'lockenunes@gmail.com',
    subject: 'First creation',
    text: 'I hope this works',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

sgMail.send(msg);