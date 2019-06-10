const app = require('./app')

// refactor setting up environment variables
// const port = process.env.PORT || 3000
const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})