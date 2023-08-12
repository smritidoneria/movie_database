const mongoose=require("mongoose");
const UserSchema=new mongoose.Schema({
  records:{
  type: String,
  required:true,
},
  ratings:{
    type:String,

  },
  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
    max:10,
  },

},
{timestamps:true});
module.exports=mongoose.model("user",UserSchema);
