const User = require('../models/User')
const Post = require('../models/Post')
const follow = require('../models/Follow')
const Follow = require('../models/Follow')

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
exports.sharedProfileData = async function(req,res, next){
    let isVisitorsProfile = false;
    let isFollowing = false;
    if(req.session.user){
        console.log(req.profileUser, '888', req.session.user)
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
    }
    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing;

    let postCountPromise = Post.countPostsByAuthor(req.profileUser._id);
    let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise = Follow.countFollowingsById(req.profileUser._id)
    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])
    
    req.postCount = postCount;
    req.followerCount = followerCount;
    req.followingCount = followingCount
    
    next()

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
    console.log(req.postCount, req.followerCount, req.followingCount)
    Post.findByAuthorId(req.profileUser._id).then(function(posts){
        res.render('profile', {
            currentPage: 'posts',
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount
            }
        })

    }).catch(function(){
        res.render('404')
    })

}

exports.profileFollowersScreen = async function(req,res){
    let followers = await Follow.getFollowersById(req.profileUser._id);
    try{
        res.render('profile-followers', {
            currentPage: 'followers',
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount
            }
        })
    }catch{
        res.render('404')
    }


}

exports.profileFollowingsScreen = async function(req,res){
    let followings = await Follow.getFollowingsById(req.profileUser._id);
    try{
        res.render('profile-followings', {
            currentPage: 'followings',
            followings: followings,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount
            }
        })
    }catch{
        res.render('404')
    }


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

exports.home = async (req,res) => {
    if(req.session.user){
        let posts = await Post.getFeed(req.session.user._id)
        res.render('home-dashboard', {posts: posts})
    }else{
        res.render('home-guest', {
            regErrors: req.flash('regErrors')
        })
    }
    
}