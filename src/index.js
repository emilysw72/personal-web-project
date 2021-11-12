const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const {handle} = require("express/lib/router")
const {request, response} = require("express")
const {check, validationResult} = require("express-validator")
const Mailgun = require("")
const Recaptcha = require("express-recaptcha").RecaptchaV2
require("dotenv").config()

const app = express()
const mailgun = new Mailgun(formData)
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)
const mailgunClient = mailgun.client({username: "api", key: process.env.MAILGUN_API_KEY})

app.use(morgan("dev"))
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const indexRoute = express.Router()

const handleGetRequest = (request, response) => {
    return response.json("The express server is live!")
}

const validation = [
    check("name", "A valid name is required.")
        .not()
        .isEmpty()
        .trim()
        .escape(),
    check("email", "Please provide a valid email.").isEmail(),
    check("message", "A message can't be longer than 2000 characters.")
        .trim()
        .escape()
        .isLength({min:1, max:2000})
]

const handlePostRequest = (request, response) => {
    const errors = validationResult(request)
    response.append("access-control-allow-origin", "*")
    console.log(request.body)
    if(errors.isEmpty() === false) {
        const currentError = errors.array()[0]
        return response.send(`<div class="alert alert-danger" role="alert"><strong>Failed!</strong> ${currentError.msg}</div>`)
    }
    if (request.recaptcha.error) {
        return response.send(`\`<div class="alert alert-danger" role="alert"><strong>Failed!</strong>There was a problem with Recaptcha, please try again.</div>`)
    }
    mailgunClient.messages.create(
        process.env.MAILGUN_DOMAIN,
        {to: process.env.MAILGUN_RECIPIENT,
        from: `${name} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
        text:message}
    ).then(()=> {
        response.send(`<div class='alert alert-success' role='alert'>Email was sent.</div>`)
    }).catch(error=> {
        response.send(`<div class='alert alert-danger' role='alert'><strong>Error!</strong>${error}</div>`)
    })

    const {email, name, message} = request.body

    mailgunClient.messages.create(
        process.env.MAILGUN_DOMAIN,
        {
            to: process.env.MAILGUN_RECIPIENT,
            from: `${name} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
            subject: 'Son Shining Rooster Website Query',
            text: message
        }
    ).then(() => {
        response.send(`<div class='alert alert-success' role='alert'>Email was sent.</div>`)
    }).catch(error => {
        response.send(`<div class='alert alert-danger' role='alert'><strong>Error!</strong>${error}</div>`)
    })
}

indexRoute.route("/")
    .get(handleGetRequest)
    .post(validation, recaptcha.middleware.verify, handlePostRequest)

app.use("/apis", indexRoute)

app.listen(4200,() => {
    console.log("Express server is built!")
})