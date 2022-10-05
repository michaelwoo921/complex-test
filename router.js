const express = require('express');
const userController = require('./controllers/userController')
const router = express.Router();

router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)


router.get('/create-post', function (req, res) {
    res.render('create-post');
  });

// test
router.get('/test', (req,res)=> {
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


module.exports = router;