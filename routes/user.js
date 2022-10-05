const express = require('express');
const User = require('../models/User');
const Cryptojs = require('crypto-js');
const router = express.Router();

// update profile
router.put('/:id', async (req,res) => {
	if(req.body.userId === req.params.id || req.body.isAdmin){
	  if(req.body.password){
	  	try{
	  	  	req.body.password = Cryptojs.AES.encrypt(req.body.password, process.env.CRYPTO_SECRET_KEY).toString()
	  	}catch(err){
	  	 return res.status(500).json(err.message);
	  	}
	  }else{
	  	try{
	  	  const updatedProfile = await User.findByIdAndUpdate(req.params.id,{
	  	  	$set:req.body,
	  	  },{new:true})
	  	  res.status(200).json(updatedProfile);
	    }catch(err){
	      return res.status(500).json(err.message)
	    }
	  }

	}else{
	  res.status(403).json({error_msg:'access denailed'})
	}
})

// delete account
router.delete('/:id', async (req,res) => {
if(req.body.userId === req.params.id || req.body.isAdmin){
	try{
	  	  await User.findByIdAndDelete(req.params.id)
	  	  res.status(200).json({msg:"Account successfully deleted"});
	    }catch(err){
	      return res.status(500).json(err.message)
	  }
}else{
	  res.status(403).json({error_msg:'access denailed'})
 }
})

// get a user
router.get('/:id', async (req,res) => {
 try{
   const user = await User.findById(req.params.id);
   const {password,isAdmin,createdAt,updatedAt, ...other} = user._doc;
   res.status(200).json(other)
 }catch(err){
 	return res.status(500).json(err.message)
 }
});

// follow a user
router.put('/:id/follow', async(req,res) => {
  if(req.body.userId !== req.params.id){
  	try{
  		// id of user to follow...
  	  const user = await User.findById(req.params.id);
  	  // current user id
  	  const currentUser = await User.findById(req.body.userId);
  	  if(!user.followers.includes(req.body.userId)){
  	  	await user.updateOne({$push:{followers:req.body.userId}})
  	  	await currentUser.updateOne({$push:{followings:req.params.id}})
  	  	res.status(200).json({msg:"User has been followed"})
  	  }else{
  	  	res.status(403).json({error_msg:'you are already following this user'})
  	  }
  	}catch(err){
  		res.status(500).json(err.message);
  	}
  }else{
  	res.status(403).json({error_msg:"you cant follow your self"})
  }
});

// unfollow user
router.put('/:id/unfollow', async(req,res) => {
  if(req.body.userId !== req.params.id){
  	try{
  	  const user = await User.findById(req.params.id);
  	  const currentUser = await User.findById(req.body.userId);
  	  if(user.followers.includes(req.body.userId)){
  	  	await user.updateOne({$pull:{followers:req.body.userId}})
  	  	await currentUser.updateOne({$pull:{followings:req.params.id}})
  	  	res.status(200).json({msg:"User has been unfollowed"})
  	  }else{
  	  	res.status(403).json({error_msg:'you are already unfollow this user'})
  	  }
  	}catch(err){
  		res.status(500).json(err.message);
  	}
  }else{
  	res.status(403).json({error_msg:"you cant unfollow your self"})
  }
});

module.exports = router;