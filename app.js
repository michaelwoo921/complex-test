const express = require('express')
const dotenv = require('dotenv')
const ejs = require('ejs')
const router = require('./router')

const app = express()

// parse form data
app.use(express.json())
app.use(express.urlencoded({
   extended: false
}))

// set up views
app.set('view engine', 'ejs')
app.use(express.static('public'))

// routes
app.use('/', router)







const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening on port ${PORT}`))