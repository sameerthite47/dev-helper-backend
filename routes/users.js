const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys').secretOrKey;
const passport = require('passport');
const _ = require('lodash');
const router = express.Router();

//Load input validations
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

//Load user model
const User = require('../models/User');

//Test route
router.get('/test', (req, res) => {
    res.send({ name: 'Test' });
});

//@Route    POST /api/users/login
//@Desc     Login User
//@Access   Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json({ message: 'Please fill all required fields'});
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({ email })
        .then(user => {
            //Check for user
            if (!user) {
                errors.email = 'User not found';
                return res.status(400).json({ message: 'User not found'});
            }

            //Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //User matched
                        const payload = { id: user.id, name: user.name, email: user.email } //Create jwt payload
                        //Sign token
                        jwt.sign(payload, keys, { expiresIn: '4h' }, (err, token) => {
                            res.json({
                                token: 'Bearer ' + token
                            })
                        });
                    } else {
                        errors.password = 'Incorrect password'
                        return res.status(400).json({ message: 'Incorrect password'});
                    }
                }).catch(err => res.status(400).json({ message: 'Something went wrong. Try again'}))
    })
});//login ends

//@Route    POST /api/users/register
//@Desc     Register User
//@Access   Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    //Find user and save
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                //User aleady exists
                errors.email = 'Email already exists.';
                return res.status(400).json(errors);
            } else {
                //Create user
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                //Encrypt password and save
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});//register ends

module.exports = router;
