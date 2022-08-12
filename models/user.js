const mongoose        = require('mongoose'),
passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sumQuiz: {
        type: Number,
        default: 0
    },
    minusQuiz: {
        type: Number,
        default: 0
    }
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);