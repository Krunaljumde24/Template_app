const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const uniqueValidator = require('mongoose-unique-validator');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

const app = express();

app.use(express.static(__dirname + "/public"))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('useCreateIndex', true);

app.use(session({
    secret: 'asdfasdfasfdasdf',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/templateDB", { useNewUrlParser: true, useUnifiedTopology: true });

const templateSchema = new mongoose.Schema({
    fname: String,
    lnamme: String,
    email: String,
});

templateSchema.plugin(uniqueValidator);

const Template = new mongoose.model("Template", templateSchema);

const usrSchema = new mongoose.Schema({
    username: String,
    password: String
});

usrSchema.plugin(passportLocalMongoose);

app.use(passport.initialize());
app.use(passport.session());

const User = mongoose.model('User', usrSchema);


app.get('/', (req, res) => {
    res.render("index");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.route('/login')
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const usr = new User({
            username: req.body.email,
            password: req.body.password
        });

        req.login(usr, (err) => {
            if (err) {
                console.log(err);
                res.redirect('/login');
            } else {
                res.render('success');
            }
        })

    });


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})


app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    User.register({ username: req.body.email }, req.body.pass2, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate("local")(req, res, () => {
                res.render('success');
            });
        }
    });
});

app.get('/success', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('success');
    } else {
        res.redirect('/');
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});