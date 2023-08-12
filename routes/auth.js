const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require("bcrypt");

//create a movie records
router.post("/register",async(req,res)=>
{
  try{
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    const newUser= new User({
      records:req.body.records,
      ratings:req.body.ratings,
      password:hashedPassword,
      email:req.body.email,



});

  const user=await newUser.save();
  res.status(200).json(user);


}catch(err)
{
  console.log(err);
}
});



module.exports=router;
