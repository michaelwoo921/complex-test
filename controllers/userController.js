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

}

exports.logout = (req,res) => {

}

exports.home = (req,res) => {
    console.log(req.body)
    res.render('home-guest')
}