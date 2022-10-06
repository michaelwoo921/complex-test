const postsCollection = require('../db').db().collection('posts');
const ObjectId = require('mongodb').ObjectId
const User = require('./User')

function Post(data, userid){
    this.data = data;
    this.userid = userid
    this.errors = []
}

Post.prototype.cleanUp = function(){
    
  
    if (typeof this.data.title != 'string') {
      this.data.title = '';
    }
    if (typeof this.data.body != 'string') {
      this.data.body = '';
    }

    // remove bogus inputs
    this.data = {
      title: this.data.title.trim(),
      body: this.data.body.trim(),
      createdDate: new Date(),
      author: ObjectId(this.userid)
    };
  }

  Post.prototype.validate = function(){
    if(this.data.title ==''){
        this.errors.push('You must provide title')
    }
    if(this.data.body ==''){
        this.errors.push('You must provide body content')
    }
}

Post.prototype.create = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            //save post into database
            postsCollection.insertOne(this.data).then(function(){
                resolve();
            }).catch(function(){
                this.errors.push('Server error');
                reject(this.errors)
            });
            
        }else{
            reject(this.errors)
        }
        
    })
}

Post.findSingleById = function(id){
    return new Promise(async function(resolve, reject){
        if(typeof id != 'string' || !ObjectId.isValid(id)){
            reject()
            return;
        }
        let posts = await postsCollection.aggregate([
            {$match : {_id: new ObjectId(id)}},
            {$lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'authorDocument'
            }},
            { $project: {
                title : 1,
                body: 1,
                createdDate: 1,
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ]).toArray()

        // clean up author property in each post object
        posts = posts.map(function(post){
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post;
        })

        if(posts.length){
            console.log(posts[0])
            resolve(posts[0])
        }else{
            reject()
        }
    })
}



module.exports = Post;