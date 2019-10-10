const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

/**
 * User schema
 * @constructor User
 */
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
                throw new Error('E-mail is invalid');
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
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});



/**
 * Método que retorna uma representação simplificada de um usuário
 * 
 * É chamado por JSON.stringfy() internamente
 * 
 * @method User.toJSON
 * @this User
 * @returns Objeto User sem avatar, token e senha
 * @see https://mongoosejs.com/docs/guide.html
 * 
 */
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

/**
 * Gera um novo token para o usuário (ao realizar login) e adiciona o token na lista de tokens do usuário
 * 
 * @method User.generateAuthToken
 * @this User
 * @returns token codificado com _id do usuário
 */
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'secret');

    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;
}

/**
 * Busca o usuário que loga no sistema
 * 
 * @method User.findByCredentials
 * @param {string} email email do usuário
 * @param {string} password senha do usuário
 * @returns Usuário
 */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( { email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

/**
 * Middleware que realiza hash de uma nova senha do usuário antes de salvar
 * 
 * @method User.preSave
 * @this User
 * 
 * @returns Usuário
 */
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});


/**
 * Middleware que remove as tasks de um usuário quando ele é deletado
 * 
 * @method User.preRemove
 * @this User
 * 
 */
userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model('User', userSchema );

module.exports = User;