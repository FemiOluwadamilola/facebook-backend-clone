const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
 userId:{
   type:String,
   required:true
 },
 post_msg:{
 	type:String,
 	max:1000
 },
 image:{
  type:Array
 },
 audio:{
   type:Array
 },
 video:{
   type:Array
 },
 likes:{
 	type:Array
 },
 comments:{
 	type:Array
 },
 shared:{
   type:Array
 }
},{timestamp:true})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;