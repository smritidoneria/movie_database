const User = require("../models/User.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
router.use(express.json());

let refreshTokens = [];

const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email, password: user.password }, "mySecretKey", {
    expiresIn: "2m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email, password: user.password }, "myRefreshSecretKey", {

  });
};

router.post("/refresh", (req, res) => {
  // Take the refresh token from the user
  const refreshToken = req.body.token;

  // Send an error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json("Refresh token is not valid!");
    }

    // Generate new access token and refresh token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update the refreshTokens array with the new refresh token
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    refreshTokens.push(newRefreshToken);

    //update the accessToken array with the new access token


    // Send the new access token and refresh token to the user
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});



// Login route to authenticate user and provide access and refresh tokens
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }

    // Generate an access JSON Web Token (JWT) and a refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({
      email: user.email,
      password: user.password,
      records: user.records,
      ratings: user.ratings,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal Server Error");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }



      req.user = user;
      next();
    });
  } else {
    res.status(401).json("not authenticated");
  }
};

//update records
router.put("/:id", async(req,res)=>{
  if(req.body.userId=== req.params.id  ){
    if(req.body.password){
       try{
        const salt=await bcrypt.genSalt(10);
        req.body.password=await bcrypt.hash(req.body.password,salt);
      }catch(err){
        return res.status(500).json(err);
      }
    }
    try{
      const user=await User.findByIdAndUpdate(req.params.id,{
        $set:req.body,
      });
      res.status(200).json("updated!!");
    }catch(err){
      return res.status(500).json(err);
    }
  }
  else{
    return res.status(403).json("ypu can update only on your accout");
  }
});


// delete movie records
router.delete("/:id",verify,async(req,res)=>
{if(req.body.userId===req.params.id)
  {
  try{
    const user=await User.deleteOne({_id:req.params.id});
    res.status(200).json("record has been deleted");
  }catch(err)
  {
    return res.status(500).json(err);
  }
}
else{
  return res.status(403).json("you can't delete this record");
}
});
// get a records
router.get("/:id",async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    const {password,...other}=user._doc
    res.status(200).json(other);
  } catch(err){
    res.status(500).json(err);
  }
})
module.exports=router;
