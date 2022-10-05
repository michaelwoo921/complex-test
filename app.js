const express = require('express')
const dotenv = require('dotenv')
const ejs = require('ejs')

const app = express()



// set up views
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req,res) => {
    res.render('home-guest')
})

app.get('/create-post', function (req, res) {
    res.render('create-post');
  });

// test
app.get('/test', (req,res)=> {
    // res.render('404')
    // res.render('search-visible')
    // res.render('post')
    // res.render('create-post')
    // res.render('home-logged-in-no-results')
    // res.render('home-logged-in-results')
    // res.render('profile-posts')
    // res.render('profile-users')
    res.render('chat-visible')

})



const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening on port ${PORT}`))