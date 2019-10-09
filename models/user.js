
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");



var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
	isAdmin: {type: Boolean, default: false},
	email: {type: String, unique: true, requires: true},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
			
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);