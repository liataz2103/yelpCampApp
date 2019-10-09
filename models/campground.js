var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	price: String,
	createdAt: {type: Date, default: Date.now},
	// in author we have id (which is object) and username (which is a string) 	
	author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
// 	since each campground may have many comments, the comment is generated as array to which comments are being pushed
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
	
});

module.exports = mongoose.model("Campground", campgroundSchema);