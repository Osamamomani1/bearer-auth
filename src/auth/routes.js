'use strict';

const express = require('express');
const authRouter = express.Router();
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const { users } = require('./models/index.js');
const basicAuth = require('./middleware/basic.js')
const bearerAuth = require('./middleware/bearer.js')

authRouter.post('/signup', async (req, res, next) => {
  console.log(req.body)
  console.log('hi error',users);

  try {
    
    let hashedPass = await bcrypt.hash(req.body.password, 10);
    // console.log(hashedPass);
    req.body.password = hashedPass;
    let userRecord = await users.create({
      username:req.body.username,
      password:req.body.password
    });
    let vartoken = await jwt.sign(userRecord.username, 'process.env.SECRET');
    // console.log('inside the try',vartoken);
    // // console.log(userRecord);
    const output = {
      user: userRecord.username,
      token: userRecord.token
    };
    res.status(200).json(output);
  } catch (e) {
    console.log('inside the catch');
    next(e.message);
    
  }
});

authRouter.post('/signin', basicAuth, (req, res, next) => {
  const user = {
    user: req.user,
    token: req.user.token
  };
  res.status(200).json(user);
});

authRouter.get('/users', bearerAuth, async (req, res, next) => {
  const user = await users.findAll({});
  const list = user.map(user => user.username);
  res.status(200).json(list);
});

authRouter.get('/secret', bearerAuth, async (req, res, next) => {
  res.status(200).send("Welcome to the secret area!")
});


module.exports = authRouter;