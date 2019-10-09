var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");



//LANDING + AUTH ROUTES (REGISTER, LOGIN, LOGOUT)
//LANDING
router.get("/", function(req, res){
    res.render("landing");
});

// SHOW REGISTER (egister form)
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});


//LOGIC REGISTER FORM
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, email: req.body.email});
	
	
	if(req.body.adminCode === "secretcode123"){
		newUser.isAdmin = true;
	}
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
		   req.flash("success", "Welcome" +" " + user.username );
           res.redirect("/campgrounds"); 
        });
    });
});

// SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.render("login", {page: 'login'}); 
});


// LOGIC LOGIN FORM
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});


// LOGOUT ROUTE
router.get("/logout", function(req, res){
   req.logout();
   res.redirect("/campgrounds");
});

//forgot password
router.get("/forgot", function(req, res){
	res.render("forgot", {page: 'forgot'}); 
});

//forgot logic
router.post("/forgot", function(req, res, next){
//we use the async.waterfall method whoch is an array of functions called one after another
	// create a token valid for 24 hours that will be sent to the user
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		//find user by email, if does not exist send a message if yse set new pass to token for 1 hour 			 and save
		function(token, done){
			User.findOne({email: req.body.email}, function(err, user){
				if(!user){
					req.flash('error', 'No account with that email address exist');
					return res.redirect("/forgot");
				}
				
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				user.save(function(err) {
					done(err, token, user);
				});
			});
		},
		//send email to user with token 
		function(token, user, done){
			var transporter = nodemailer.createTransport({
    			host: 'smtp.gmail.com',
   				port: 465,
    			secure: true,
				auth: {
					user: 'learntocodeinfo003@gmail.com',
					pass: process.env.GMAILPW //on the server export GMAILPW=yourpassword (or you can use the dotenv package- read about it)
				}
			}),
			mailOptions = {
        to: user.email,
        from: 'learntocodeinfo003@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
			//actually send the email
			transporter.sendMail(mailOptions, function(err, ){
				req.flash("success", "An email has been sent to " + user.email + " with further instructions")
				done(err, "done");
			});
		}	
	], function(err){
		if (err) return next(err);
		res.redirect("/forgot");
	});
});

//reset route

router.get('/reset/:token', function(req, res) {
	// 	we serach the user with the specific tokem and make sure that expire time is greater then (gt) date.now
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

// Creating the new password and confirming
router.post("/reset/:token", function(req, res){
	async.waterfall([
		function(done) {
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user){
				if(!user){
					req.flash("error", "Password reset token is invalid or has expired" );
					return res.redirect	("back");
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password, function(err){
						user.resetPasswordToken = undefined;
            			user.resetPasswordExpires = undefined;
// 						we save the user with the new pass to the db and login with the new password(req.login)
						user.save(function(err){
							req.login(user, function(err){
								done(err, user);
							});
						});
					})
				}else{
					req.flash("error", "Password do not match");
					return res.redirect("back");
				}
			});
		},
		function(user, done) {
			var transporter = nodemailer.createTransport({
    			host: 'smtp.gmail.com',
   				port: 465,
    			secure: true,
				auth: {
				user:"learntocodeinfo003@gmail.com",
				pass: process.env.GMAILPW
			}
			});
			var mailOptions = {
				to: user.email,
				from: "learntocodeinfo003@gmail.com",
				subject: "your password has been changed",
				text: "Hello, \n\n" + "This is a confirmation that the password for your account" + user.email + "has just changed"
			};
			
			transporter.sendMail(mailOptions, function(err){
				req.flash("success", "Your password has been changed");
				done(err);
			});
		}
	], function (err){
		if(err){
			console.log(err)
		}else{
			res.redirect("/campgrounds");
		}
		
	});
});



module.exports = router;