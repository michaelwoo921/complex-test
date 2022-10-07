const Post = require('../models/Post')


exports.viewCreateScreen = function(req,res){
    res.render('create-post', {username: req.session.user.username, avatar: req.session.user.avatar})
}

exports.create = function(req,res){
    const post = new Post(req.body, req.session.user._id);
    post.create().then(function(newId){
        // redirect to post with flash message
        req.flash('success', 'new post created')
        req.session.save(function(){
            res.redirect(`/post/${newId}`)
        })

    }).catch(function(errors){
        errors.forEach(error => {
            req.flash('errors', error)
        })
        req.session.save(function(){
            res.redirect('/create-post')
        })
       
    })
}

exports.viewSingle = async function(req,res){
    try{
        const post = await Post.findSingleById(req.params.id, req.visitorId);
        res.render('single-post-screen', {post, title: post.title})
    }catch{
        res.render('404')
    }
}

exports.viewEditScreen =async function(req,res){
    try{
        const post = await Post.findSingleById(req.params.id, req.visitorId);
        if(post.isVisitorOwner){
            res.render('edit-post', {post})
        } else {
            req.flash("errors", "You do not have permission to perform that action")
            req.session.save(function(){
                res.redirect('/')
            })
        }
        
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

exports.delete = function(req,res){
    Post.delete(req.params.id, req.visitorId).then(function(){
        req.flash('success', 'Post successfully deleted')
        req.session.save(function(){
            res.redirect(`/profile/${req.session.user.username}`)
        })
    }).catch(function(){
        req.flash('errors', 'You do not have permission to perform that action.')
        req.session.save(() => res.redirect('/'))
    })
}

exports.search = function(req,res){
    Post.search(req.body.searchTerm).then((posts) => {
        res.json(posts)
    }).catch(() => {
        res.json([])
    })
}