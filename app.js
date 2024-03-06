const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const userroute=require("./controllers/userrouter")

const app=express()

app.use(express.json())
app.use(cors())

app.use("/api/users",userroute)


mongoose.connect("mongodb+srv://anilasandrajose01:sandrajoseph99@cluster0.vpgykyq.mongodb.net/wisewayDb?retryWrites=true&w=majority",
{
    useNewUrlParser:true
})




app.listen(3002,()=>{
    console.log("server running")
})

