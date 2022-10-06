const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const dotenv = require('dotenv')
const ejs = require('ejs')
const router = require('./router')

const app = express()
// session
const sessionOptions = session({
   secret: 'nevergiveup',
   resave: false,
   saveUninitialized: false,
   cookie: {
      maxAge: 1000*60*60*21,
      httpOnly: true
   },
   store: MongoStore.create({
      client: require('./db')
   })
})
app.use(sessionOptions);
app.use(flash())

// accesing session data from templates
app.use(function(req,res, next){

   req.visitorId = req.session.user ? req.session.user._id : 0;

   res.locals.user = req.session.user;
   next()
})


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


module.exports = app;