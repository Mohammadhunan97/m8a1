const express 	  = require('express'),
 app			  = express(),
 passport 		  = require('passport'),
 session 		  = require('express-session'),
 FacebookStrategy = require('passport-facebook'),
 mysql			  = require('mysql'),
 bodyParser 	  = require('body-parser'),
 ejs			  = require('ejs'),
 key 			  = require('./key.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(session({ secret: 'it370' }));
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password: 'shoebilljs123'
});

//must create the db and tables first using the command source model/schema.sql
connection.query('USE m8a1');	

passport.serializeUser(function(user, done) {
		done(null, user.id);
});

    // used to deserialize the user
passport.deserializeUser(function(id, done) {
	connection.query("select * from users where id = "+id,function(err,rows){	
			done(err, rows[0]);
	});
});

passport.use(new FacebookStrategy({
    clientID: key.fb.id,
    clientSecret: key.fb.secret,
    callbackURL: "/auth/facebook/redirect",
    profileFields: ['id'] 
  },
  function(accessToken, refreshToken, profile, done){
  		connection.query("SELECT * FROM users WHERE facebook_id = " + profile.id, function(err,rows){
  			if(err){ return done(err); }
  			if(rows.length) {
  				// user successfully signed in
  				done(null, rows[0]);
  			}else{
  				let query = `INSERT INTO users (facebook_id) VALUES (${profile.id});`;
  				connection.query(query,function(err,rows){
  					connection.query("SELECT * FROM users WHERE facebook_id = " + profile.id, function(err,rows){
  						done(null,rows[0]);
  					});
				});	
  			}
  		})
  }
));

app.get('/',(req,res) => {
	res.render('index');
})
app.get('/auth/facebook', passport.authenticate('facebook',{
	scope: ['public_profile']
}));
app.get('/auth/facebook/redirect',passport.authenticate('facebook'),(req,res) => {
	res.redirect('/home');
})
app.get('/home',(req,res) => {
	if(req.user){
		connection.query("SELECT * FROM notes WHERE user_id = " + req.user.id,function(err,rows){
			res.render('homepage', {notes: JSON.stringify(rows)});
		})
	}else{
		res.redirect('/');
	}
});
app.post('/note/new',(req,res) => {
	console.log(req.user.id);
	let query = `INSERT INTO notes (user_id,description) VALUES(${req.user.id},'${req.body.description}');`;
	connection.query(query,function(err,rows){
		if(err){
			console.log(err);
		}else{
			console.log(rows);
			res.redirect('/home');
		}
	})
})
app.delete('/note/delete/:id',(req,res) => {
	let query = `DELETE FROM notes WHERE id = ${req.params.id}`;
	connection.query(query,function(err,rows){
		if(err){
			console.log(err);
			res.send(err);
		}else{
			console.log(rows);
			res.send(rows);
		}
	})
})

app.get('/note/update/:id',(req,res) => {
	let query = `SELECT * FROM notes WHERE id = ` + req.params.id;
	connection.query(query,function(err,rows){
		res.render('updatenote', {notes: JSON.stringify(rows)});
	});
});

app.post('/note/update/:id',(req,res) => {
	let query = `UPDATE notes SET description = '${req.body.description}' WHERE id = ${req.params.id}`;
	console.log(query);
	connection.query(query,function(err,rows){
		res.redirect('/home');
	});
})

app.listen(3000,(error) => {
	if(error){
		console.log('some error occured:',error);
	}else{
		console.log('listening on port:',3000);
	}
})

  