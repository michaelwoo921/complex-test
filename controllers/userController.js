const User = require('../models/User')
const Post = require('../models/Post')

exports.mustBeLoggedIn = function(req,res,next){
    if(req.session.user){
        next()
    } else {
        req.flash('errors', 'You must be logged in to perform that action');
        req.session.save(function(){
            res.redirect('/')
        })
        
    }
}

exports.ifUserExists = function(req,res,next){
    User.findByUsername(req.params.username).then(function(userDocument){
        req.profileUser = userDocument;
        next()
    }).catch(function(){
        res.render('404');
    })
}

exports.profilePostsScreen = function(req,res){
    // get posts by profileUser
    Post.findByAuthorId(req.profileUser._id).then(function(posts){
        console.log(posts)
        res.render('profile', {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar
        })

    }).catch(function(){
        res.render('404')
    })

}

exports.register = (req,res) => {
    const user= new User(req.body)
    user.register().then(() => {
        req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach(function(error){
            req.flash('regErrors', error)
        })
        req.session.save(function(){
            res.redirect('/')
        })
    })
}

exports.login = (req,res) => {
    const user = new User(req.body);
    user.login().then(() => {
        req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
        
    }).catch(function(e){
        req.flash('errors', e)
        req.session.save(function(){
            res.redirect('/');
        })
        
    })

}

exports.logout = (req,res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })

}

exports.home = (req,res) => {
    if(req.session.user){
        res.render('home-dashboard')
    }else{
        res.render('home-guest', {
            errors: req.flash('errors'),
            regErrors: req.flash('regErrors')
        })
    }
    
}