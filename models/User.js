const bcrypt = require('bcryptjs');

const usersCollection = require('../db').db().collection('users')


const validator = require('validator');
function User(data){
    this.data = data;
    this.errors =[];
}

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

User.prototype.validate =function(){
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
}


User.prototype.register= function(){
        // clea bogus data
        this.cleanUp()
        // validate user
        this.validate()
        //save to database
        if(!this.errors.length){
          // hash user password
          const salt = bcrypt.genSaltSync(10)
          this.data.password = bcrypt.hashSync(this.data.password, salt)
          usersCollection.insertOne(this.data)
        }
}

User.prototype.login = function(){
  return new Promise((resolve, reject) =>{
    this.cleanUp()
    usersCollection.findOne({username: this.data.username}).then((attemptedUser) =>{
      if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
        resolve('congrat!')
      }  else{
        reject('invalid credential')
      }
    }).catch((err)=>{
      reject('server error')
    })
      
      
    
  })
}

  

module.exports = User;