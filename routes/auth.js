const express = require('express');
const User = require('../models/User');
const Cryptojs = require('crypto-js');
const router = express.Router();

router.post('/signup', async (req,res) => {
  	const {username,email} = req.body;
  try{
     const user = await User.findOne({email})
     if(user){
       res.status(403).json({error_msg:`this ${user.email} is already register with system!`})
     }else{
      const newUser = new User({
      username,
      email,
      password:Cryptojs.AES.encrypt(req.body.password, process.env.CRYPTO_SECRET_KEY).toString()
    })

    const result = await newUser.save();
    const {password,...others} = result._doc;
    res.status(200).json(others);
   }
  }catch(err){
  	res.status(500).json({error_msg:err.message})
  }
})

router.post('/signin', async (req,res) => {
  try{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.status(401).json({error_msg:'wrong email'})
    }else{
      const hashedPassword = Cryptojs.AES.decrypt(user.password, process.env.CRYPTO_SECRET_KEY);

      const decryptedPassword = hashedPassword.toString(Cryptojs.enc.Utf8);

      if(decryptedPassword !== req.body.password){
          res.status(401).json({msg:'wrong password!!!'});
      }else{
        const {password, ...others} = user._doc;
        res.status(200).json(others);
      }
    }
  }catch(err){
    res.status(500).json(err.message);
  }
});

module.exports = router;