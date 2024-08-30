const mongoose=require( 'mongoose');
const plm=require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/pin");
const userschema=mongoose.Schema({
  username:String,
  email:String,
  profilephoto:String,
  contact:Number,
  password:String,
  boards:{
    type:Array,
    default:[]
  },
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'post'
    }
  ]
});
userschema.plugin(plm);
module.exports=mongoose.model("user",userschema)