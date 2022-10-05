const validator = require('validator');
function User(data){
    this.data = data;
    this.errors =[];
}

User.prototype.cleanUp = function(){
    console.log('clean data')
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
}




module.exports = User;