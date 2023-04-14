const {Schema, model} = require('mongoose');
const validator = require('validator');

const userSchema = new Schema({
    username: { 
        type: String,
        required: true,
        unique: true,
        trim: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
    },
    //check these two
    thoughts: [{
        type: Schema.Types.ObjectId,
        ref: 'Thought'
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]},
    {
    toJSON: {
      virtuals: true,
    },
    id: false
});
//Create a virtual called friendCount
userSchema.virtual('friendCount').get(function() {
    return this.friends.length;
});
      
const User = model('User', userSchema);

module.exports = User;