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

Follow.prototype.validate = async function(){
    // followedUsername must exist in users collection

    const followedAccount = await usersCollection.findOne({username: this.followedUsername})
    console.log(followedAccount)
    if(followedAccount){
        this.followedId = followedAccount._id 
    }else {
        this.errors.push("You cannot follow a user who doesn't exist")
    }
}


Follow.prototype.create = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()
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

module.exports = Follow;