const bcrypt = require('bcryptjs');
const md5 = require('md5');
const usersCollection = require('../db').db().collection('users');
const validator = require('validator');


function User(data, getAvatar){
    this.data = data;
    this.errors =[];
    if(getAvatar == undefined){ getAvatar = false}
    if(getAvatar){
      this.getAvatar()
    }
};

User.prototype.cleanUp = function(){
  // remove bogus inputs

  if (typeof this.data.username != 'string') {
    this.data.username = '';
  }
  if (typeof this.data.email != 'string') {
    this.data.email = '';
  }
  if (typeof this.data.password != 'string') {
    this.data.password = '';
  }
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
}

User.prototype.validate = function(){
  return new Promise(async (resolve, reject) => {
    if (this.data.username == '') {
        this.errors.push('you must provide username');
      }
      if (!validator.isAlphanumeric(this.data.username)) {
        this.errors.push('Username must contain only letters and numbers');
      }
      if (!validator.isEmail(this.data.email)) {
        this.errors.push('You must provide a valid email');
      }
      if (this.data.password == '') {
        this.errors.push('you must provide password');
      }
      if (this.data.password.length > 0 && this.data.password.length < 12) {
        this.errors.push('Password must be at least 12 characters');
      }
      if (this.data.password.length > 50) {
        this.errors.push('Password cannot exceed 50 characters.');
      }
      if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push('Username must be at least 3 characters');
      }
      if (this.data.username.length > 30) {
        this.errors.push('Username cannot exceed 30 characters.');
      }

      // when username is valid check if username is taken
      // when email is valid check if email is taken
      if (validator.isEmail(this.data.email)) {
        let emailExists = await usersCollection.findOne({
          email: this.data.email,
        });
        if (emailExists) {
          this.errors.push('That email is already being used');
        }
      }
      if (this.data.username.length > 2 && this.data.username.length < 31 &&
        validator.isAlphanumeric(this.data.username)) {
        // usernameExists
        let usernameExists = await usersCollection.findOne({
          username: this.data.username,
        });
        if (usernameExists) {
          this.errors.push('That username is already taken');
        }
      }
      resolve()
}
)
}

User.prototype.register= function(){
  return new Promise(async (resolve, reject) =>{
    // clea bogus data
    this.cleanUp()
    // validate user
    await this.validate()
    //save to database
    if(!this.errors.length){
      // hash user password
      const salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    }else {
      reject(this.errors)
    }
})
}

User.prototype.login = function(){
  return new Promise((resolve, reject) =>{
    this.cleanUp()
    usersCollection.findOne({username: this.data.username}).then((attemptedUser) =>{
      if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
        this.data = attemptedUser
        this.getAvatar();
        resolve('congrat!')
      }  else{
        reject('invalid credential')
      }
    }).catch((err)=>{
      reject('server error')
    })
      
      
    
  })
}

User.prototype.getAvatar = function(){
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

module.exports = User;