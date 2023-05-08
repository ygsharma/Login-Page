const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User.js');

// Login
router.get("/login", (req, res) => {
  res.render("login");
});

// Register
router.get("/register", (req, res) => {
  res.render("register");
});

// register handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // check required field
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // check password
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be atlest 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: "Email is already registered." });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            // set password to hash
            newUser.password = hash;
            // save user
            newUser.save()
              .then((user) => {
                req.flash('success_msg', 'You are now registered and can log in!')
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout',(req, res) => {
    req.logout(err => {
        if(err) throw err;
    });
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;
