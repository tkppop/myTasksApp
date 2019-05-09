const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/task')

const app = express()
// refactor setting up environment variables
// const port = process.env.PORT || 3000
const port = process.env.PORT
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

app.use(express.json())

//To register routes in the router files 
app.use(userRouter)
app.use(taskRouter)

// app.post('/users', (req, res) => {
//     const user = new users(req.body)
//     user.save().then(() => {
//         res.status(201).send(user)
//     }).catch((e) => {
//         res.status(400).send(e)
//     })
// })
//Refactor/convert the code above to async & await



app.listen(port, () => {
    console.log('Server is up on port ' + port)
})