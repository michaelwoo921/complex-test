const Post = require('../models/Post')


exports.viewCreateScreen = function(req,res){
    res.render('create-post', {username: req.session.user.username, avatar: req.session.user.avatar})
}

exports.create = function(req,res){
    const post = new Post(req.body, req.session.user._id);
    post.create().then(function(){
        // redirect to post with flash message
        res.send('new post create')
    }).catch(function(errors){
        res.send(errors)
    })
}

exports.viewSingle = async function(req,res){
    try{
        const post = await Post.findSingleById(req.params.id);
        res.render('single-post-screen', {post})
    }catch{
        res.send('404 template goes here')
    }

}