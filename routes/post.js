const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

/*
 file upload algorithm middleware with multer
*/

// const storage = multer.diskStorage({
//       destination:'./public/uploads',
//       filename: (req,file,callback) =>{
//       	if(file.originalname.length>6)
//       callback(null, file.fieldname + "_" + Date.now() + file.originalname.substr(file.originalname.length-6,file.originalname.length));
//     else
//       callback(null,  file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//       },
//     });

//     const userPost = multer({
//     	storage,
//     	// filefilter: (req,file,cb) => {
//     	//   const extname = path.extname(file.originalname);
//     	//   switch(extname){
//     	//   	case'.jpg':

//     	//   }
//     	// }
//     });

//    const filesUpload = userPost.fields([{name:'audio', maxCount: 1},{name:'image', maxCount:1},{name:'video', maxCount:1}]);

// // create a post
// router.post('/', filesUpload , async (req,res) => {
//  try{
//  	if(req.files){

//  		// const fileType = req.files.map(file => file.filename);
//  		// console.log(req.files);

//  	  // const file = {
//  	  // 	video:req.files.video.map(file => {
//  	  // 		return file.filename
//  	  // 	}),
//  	  // 	audio:req.files.audio.map(file => {
//  	  // 		return file.filename
//  	  // 	}),
//  	  // 	image:req.files.image.map(file => {
//  	  // 		return file.filename
//  	  // 	})
//  	  // }

//  	  const image = req.files.image[0];
//  	  const video = req.files.video[0];
//  	  const audio = req.files.audio[0];

//  	  console.log(image.filename)

//  	//   const newUserPost = new Post({
//  	//   userId:req.body.userId,
//  	//   post_msg:req.body.post_msg,
//  	//   image:image.filename,
//  	//   audio:audio.filename,
//  	//   video:video.filename
//  	// })
//  	// const savedUserPost = await newUserPost.save();
//  	// res.status(200).json(savedUserPost);

//  	}else{
//  	   console.log('something went wrong while uploading files')
//  	}
//  	// const newUserPost = new Post({
//  	//   userId:req.body.userId,
//  	//   post_msg:req.body.post_msg,
//  	//   image:req.files.image[0].filename,
//  	//   audio:req.files.audio[0].filename,
//  	//   video:req.files.video[0].filename
//  	// })

//  	// const savedUserPost = await newUserPost.save();
//  	// res.status(200).json(savedUserPost);
//  }catch(err){
//    res.status(500).json(err.message)
//  }
// })


// user post route
router.post('/:userId', async (req,res) => {
	const {post_msg} = req.body;
  try{
  	const userId = req.params.userId;
  	const user = await User.findById(userId);
  	if(userId === user.id){
  		 const newPost = new Post({
  		 	 userId,
  		 	 post_msg
  		 })
  		const post = await newPost.save();
  		res.status(200).json(post);
  	}else{
  		res.status(403).json({error_msg:"invalid user id..."})
  	}
  }catch(err){
  	res.status(500).json({error_msg:err.message})
  }
})

// edit post
router.put('/:id', async (req,res) => {
	try{
	  const post = Post.findById(req.params.id);
     if(post.userId !== req.body.userId){
  		const editedPost = await Post.findOneAndUpdate(req.params.id,{
  	  	$set:req.body,
	  	  },{new:true})
	  	  res.status(200).json(editedPost);
	  }else{
	  	res.status(403).json({error_msg:"access denailed"})
	  }
  	}catch(err){
  	 res.status(500).json(err.message);
  	}
});

// delete post
router.delete('/:id', async (req,res) => {
	try{
	  const post = await Post.findById(req.params.id);
     if(post.userId !== req.body.userId){
  		await Post.findByIdAndDelete(req.params.id);
  		res.status(200).json({msg:'Post deleted...'})
	  }else{
	  	res.status(403).json({error_msg:"access denailed"})
	  }
  	}catch(err){
  	 res.status(500).json(err.message);
  	}
});

// like and dislike post
router.put('/:id/like', async (req,res) => {
		const userId = req.body.userId;
	try{
		const user = await User.findById(userId);
	  const post = await Post.findById(req.params.id);
     if(!post.likes.includes(userId)){
  		await post.updateOne({$push:{likes:{userId}}});
  		res.status(200).json({msg:`${user.username} liked your post`})
	  }else{
	  	// dislike
	    await post.updateOne({$pull:{likes:{userId}}});
  		res.status(200).json({msg:`${user.username} disliked your post`})
	  }
  	}catch(err){
  	 res.status(500).json(err.message);
  	}
});

// get post
router.get('/:id', async (req,res) => {
 try{
  const post = await Post.findById(req.params.id);
  res.status(200).json(post);
 }catch(err){
  res.status(500).json(err.message);
 }
})

//get user newsfeed
router.get('/:id/newsfeed', async (req,res) => {
	 const userId = req.params.id;
	try{
	  const currentUser = await User.findById(userId);
	  const userPosts = await Post.find({userId: currentUser._id});
	  const friendTimelines = await Promise.all(
	  	currentUser.followings.map((friendId) => {
	  		 return Post.find({userId: friendId})
	  	})
	  );
	  res.status(200).json(userPosts.concat(...friendTimelines))
	}catch(err){
  	  res.status(500).json(err.message);
 	}
})

// post comment
router.put('/:id/comment', async (req,res) => {
 	const userId = req.body.userId;
 try{
 	const commentMsg = req.body.msg;
 	const user = await User.findById(userId);
 	const post = await Post.findById(req.params.id);
 	await post.updateOne({$push:{comments:{userId, commentMsg }}});
 	res.status(200).json({msg:`${user.username} commentted to this post`});
 }catch(err){
 	res.status(500).json(err.message);
 }
})

// share post route
router.put('/:id/share', async (req,res) => {
		const userId = req.body.userId;
		const postId = req.params.id;
	try{
		const user = await User.findById(userId);
		const post = await Post.findById(postId);
		await post.updateOne({$push:{shared:{userId}}});
		await user.updateOne({$push:{sharedPost:{postId}}});
 		res.status(200).json({msg:`${user.username} shared your post`})
	}catch(err){
		 res.status(500).json({error_msg:err.message});
	}
});

module.exports = router;

