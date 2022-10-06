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
        const post = await Post.findSingleById(req.params.id, req.visitorId);
        res.render('single-post-screen', {post})
    }catch{
        res.render('404')
    }
}

exports.viewEditScreen =async function(req,res){
    try{
        const post = await Post.findSingleById(req.params.id);
        res.render('edit-post', {post})
    }catch{
        res.render('404')
    }
}

exports.edit = function(req,res){
        // update post
        const post = new Post(req.body, req.visitorId, req.params.id)
        post.update().then(function(status){
            if(status == 'success'){
                // updated to db
                req.flash("success", "post successfully updated")
                req.session.save(function(){
                    res.redirect(`/post/${req.params.id}/edit`)
                })
            }else{
                // validation error
                post.errors.forEach(function(error){
                    req.flash("errors", error)
                    req.session.save(
                        function(){
                            res.redirect(`/post/${req.params.id}/edit`)
                        }
                    )
                    
                })
            }
        }).catch(function(){
            // visitor is not owner of the post
            req.flash("errors", "You do not have permisssion to perform that action")
            req.session.save(function(){
                res.redirect('/')
            })
        })
   
}