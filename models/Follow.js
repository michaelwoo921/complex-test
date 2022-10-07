const ObjectId = require('mongodb').ObjectId;

const usersCollection = require('../db').db().collection('users')
const followsCollection = require('../db').db().collection('follows')

function Follow(followedUsername, authorId){
    this.followedUsername = followedUsername;
    this.authorId = authorId;
    this.errors = []
}

Follow.prototype.cleanUp = function(){
    if(typeof this.followedUsername !='string'){
        this.followedUsername =''
    }
}

Follow.prototype.validate = async function(action){
    // followedUsername must exist in users collection

    const followedAccount = await usersCollection.findOne({username: this.followedUsername})
    if(followedAccount){
        this.followedId = followedAccount._id 
    }else {
        this.errors.push("You cannot follow a user who doesn't exist")
    }

    let doesFollowAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)})
    if(action == 'create'){
        if(doesFollowAlreadyExist){
            this.errors.push('You are already following this user')
        }
    }
    if(action == 'delete'){
        if(!doesFollowAlreadyExist){
            this.errors.push('You already stopped following this user')
        }
    }
    // shouldn't follow your self
    if(this.followedId.equals(this.authorId)){
        this.errors.push('You cannot follow your self')
    }
}


Follow.prototype.create = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate('create')
        if(!this.errors.length){
            await followsCollection.insertOne({
                followedId: this.followedId, authorId: new ObjectId(this.authorId)
            })
            resolve()
        } else {
            reject(this.errors)
        }


    })
}

Follow.prototype.delete = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate('delete')
        if(!this.errors.length){
            await followsCollection.deleteOne({
                followedId: this.followedId, authorId: new ObjectId(this.authorId)
            })
            resolve()
        } else {
            reject(this.errors)
        }


    })
}

Follow.isVisitorFollowing = async function(followedId, visitorId){
    let followDoc = await followsCollection.findOne({followedId, authorId: new ObjectId(visitorId)})
    if(followDoc){
        return true
    } else {
        return false
    }
}

module.exports = Follow;