const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'ptk16@case.edu',
//     from: 'ptk16@case.edu',
//     subject: 'Hello world email!!',
//     text: 'Test email to trigger email.'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ptk16@case.edu',
        subject: 'Welcome to the Task App',
        text: ` Welcome to the Task Manager App, ${name}. Looking forward to your postitive feedback.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ptk16@case.edu',
        subject: 'Sorry to see you go',
        text: ` Your Task Manager App account with name ${name} and email ${email} has been deleted. We hope you come back soon.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}