const path = require("path");

const express = require("express");
const app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "static")));

const session = require("express-session");
app.use(session({
	secret: "herropreash",
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 600000 }
}))

const flash = require("express-flash");
app.use(flash());

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/message_board", { useNewUrlParser: true });
var CommentSchema = new mongoose.Schema({
	creator: { type: String, required: [true, "Name can not be blank!"], minlength: [3, "Name must be more than 3 characters"] },
	content: { type: String, required: [true, "Comment can not be blank!"], minlength: [3, "Comment must be more than 3 characters"] }
});
mongoose.model("Comment", CommentSchema);
var Comment = mongoose.model("Comment");

var MessageSchema = new mongoose.Schema({
	creator: { type: String, required: [true, "Name can not be blank!"], minlength: [3, "Name must be more than 3 characters"] },
	content: { type: String, required: [true, "Message can not be blank!"], minlength: [3, "Message must be more than 3 characters"] },
	comments: [CommentSchema]
});
mongoose.model("Message", MessageSchema);
var Message = mongoose.model("Message");

app.get("/", function(req, res){
	Message.find({}, function(err, message){
		res.render("index", { message });
	})
})

app.post("/message", function(req, res){
	var message = new Message({ creator: req.body.name, content: req.body.msg });
	message.save(function(err){
		if(err){
			for(var key in err.errors){
				req.flash("errors", err.errors[key].message);
			}
			res.redirect("/");
		}
		else{
			res.redirect("/")
		}
	})
})

app.post("/comment", function(req, res){
	var comment = new Comment({ creator: req.body.name, content: req.body.comment });
	comment.save(function(err){
		if(err){
			for(var key in err.errors){
				req.flash("errors", err.errors[key].message);
			}
			res.redirect("/");
		}
		else{
			Message.update({ _id: req.body.msg_id }, {$push: {comments: [ comment ]}}, function(err, message){
				if(err){
					for(var key in err.errors){
						req.flash("errors", err.errors[key].message);
					}
					res.redirect("/");
				}
				else{
					res.redirect("/");
				}
			})
		}
	})
})

app.listen(1337);