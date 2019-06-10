//refactored index to app.js withour listen call
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/task')
const path = require('path')
const hbs = require('hbs')


const app = express()

// set to true for maintenance mode
const maintenanceStatus = false 


//Middleware function to trigger maintenance mode
app.use((req, res, next) => {
	if (maintenanceStatus) {
		res.send('Server is under maintenance')
	} else {
		next()
	}
})

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)


// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.use(express.json()) // for parsing application/json

//To register routes in the router files 
app.use(userRouter)
app.use(taskRouter)

app.get('', (req, res) => {
    res.render('index', {
        title: 'Get Shit Done',
        name: 'Prasanna Krishnan'
    })
})

app.get('/list', (req, res) => {
    res.render('list', {
        title: 'Get Shit Done',
        name: 'Prasanna Krishnan'
    })
})

// app.post('/users', (req, res) => {
//     const user = new users(req.body)
//     user.save().then(() => {
//         res.status(201).send(user)
//     }).catch((e) => {
//         res.status(400).send(e)
//     })
// })
//Refactor/convert the code above to async & await



module.exports = app
