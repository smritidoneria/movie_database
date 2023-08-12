const express=require("express");
const dotenv=require("dotenv");
const helmet=require("helmet");
const userRoute=require("./routes/users");
const authRoute=require("./routes/auth");
const app=express();
const mongoose=require("mongoose");


dotenv.config();
mongoose.connect(process.env.MONGO_URL
).then(()=> console.log("connected successfully"))
.catch((err)=>{console.error(err);});
app.use(express.json());
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute)
app.listen(3000,function(req,res)
{
  console.log("server is started on port 3000");
});
