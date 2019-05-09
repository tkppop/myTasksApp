const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token : {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// When a Mongoose document is passed to, Mongoose converts the object into JSON. 
// You can customize this by adding as a method on the object.
// The method below removes the password and properties before sending the response back.
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//define custom methods (sometimes called instance methods)
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'thisisatest')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


//define statics methods (sometimes called model methods)
//They are accessible on the model and the custom methods are accessible on the instance.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user) {
        throw new Error('Unable to login!!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Unable to login!!')
    }
    return user
}

// This method is to hash plain text password before saving
// The callback function has to be standard funtion, since 'this' operater is used
// and the arrow funtion does not bind 'this' 
userSchema.pre('save', async function(next) {
    const user = this
    //Checking to see if password attribute was modified
    if (user.isModified('password')) {
        //Hashing password using bcrypt
        user.password = await bcrypt.hash(user.password,8)
    }
    //gives control back to mongoose , else it will keep running
    next()
})

// Delete user's tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User