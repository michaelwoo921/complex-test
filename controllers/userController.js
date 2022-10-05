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
        req.session.save(function(){
            res.redirect('/')
        })
        
    }).catch(err =>res.send(err))

}

exports.logout = (req,res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })

}

exports.home = (req,res) => {
    if(req.session.user){
        res.render('home-dashboard', {username: req.session.user.username})
    }else{
        res.render('home-guest')
    }
    
}