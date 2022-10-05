const User = require('../models/User')

exports.register = (req,res) => {
    const user= new User(req.body)
    user.register()
    if(user.errors.length){
        res.send(user.errors)
    } else{
        res.json('congrat no errors')
    }   

    
}

exports.login = (req,res) => {
    const user = new User(req.body);
    user.login().then(function(result){
        req.session.user = {username: user.data.username}
        res.send(result)
    }).catch(err =>res.send(err))

}

exports.logout = (req,res) => {

}

exports.home = (req,res) => {
    if(req.session.user){
        res.send('welcome to actual application')
    }else{
        res.render('home-guest')
    }
    
}