const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const dotenv = require('dotenv')
const ejs = require('ejs')
const router = require('./router')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')
const csrf = require('csurf')

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

   res.locals.filterUserHTML = function(content){
      return sanitizeHTML(markdown.parse(content), {
         allowedTags: ['h1', 'p', 'strong', 'i', 'a'],
         allowedAttributes: {}
      })
   }
   res.locals.user = req.session.user;
   res.locals.errors = req.flash("errors")
   res.locals.success = req.flash("success")
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

app.use(csrf())
app.use(function(req,res,next){
   res.locals.csrfToken = req.csrfToken()
   next()
})

// routes
app.use('/', router)

app.use(function(err,req,res,next){
   if(err){
      if(err.code == 'EBADCSRFTOKEN'){
         req.flash('errors', 'cross site request forgery detected')
         req.session.save(() => res.redirect('/'))
      }else{
         res.render('404')
      }
   }
})

const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.use(function(socket, next){
   sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket){

   if(socket.request.session.user){
      let user = socket.request.session.user
      socket.emit('welcome', {username: user.username, avatar: user.avatar} )

      socket.on('chatMessageFromBrowser', function(data){
         socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {
            allowedTags: [], allowedAttributes: {}
         }), username: user.username, avatar: user.avatar})
      })
   }

})

module.exports = server;