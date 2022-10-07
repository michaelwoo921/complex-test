const Follow = require("../models/Follow")

exports.addFollow = function(req,res){
    const follow = new Follow(req.params.username, req.visitorId)
    follow.create().then(function(){
        req.flash("success", `succesfully followed ${req.params.username}`)
        req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch(function(errors){
        errors.forEach(error => req.flash('errors', error))
        req.session.save(() => res.redirect('/'))
    })
}


exports.removeFollow = function(req,res){
    const follow = new Follow(req.params.username, req.visitorId)
    follow.delete().then(function(){
        req.flash("success", `succesfully stopped following ${req.params.username}`)
        req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch(function(errors){
        errors.forEach(error => req.flash('errors', error))
        req.session.save(() => res.redirect('/'))
    })
}