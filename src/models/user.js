const mongoose = require('mongoose');
const validator = require("validator");
const jwt = require('jsonwebtoken');
const Task = require('./reminder')

const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(val) {
            if (val < 0)
                throw new Error('Age should be gretaer than 0');
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(val) {
            if (!validator.isEmail(val))
                throw new Error("Email is invalid")
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(val) {

            if (val.includes('password'))
                throw new Error('Pass should not contain password')
        }
    },
    tokens: [{
        token:
        {
            type: String,
            required: true
        }
    }]
},
    {
        timestamps: true
    })


userSchema.statics.findByCredentials = async (email, pass) => {
    const user = await User.findOne({ email })
    console.log(user)
    if (!user)
        throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(pass, user.password)
    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

userSchema.virtual('tasks', {
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
})

//THIS WILL BE CALLED WHEN res.send() is called
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

//TO GENRATE A TOKEN
userSchema.methods.genrateAuthToken = async function () {
    const user = this

    const token = await jwt.sign({ _id: user._id.toString() }, 'mykey')
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token;
}


//TO HASH PASSWORD BEFORE SAVING
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)


    next()
})


const User = mongoose.model('User', userSchema)



module.exports = User;