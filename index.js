const axios = require('axios')
const express = require('express');
const dbMethods = require('./DatabaseControl');

const app = express();

ping = async () => {
    
    setInterval(async () => {
            try{
                var req = await axios.get(`https://h3ppo.herokuapp.com/ping-bavana`);
                console.log("trying to ping")
            }
            catch(e){
                console.log(`Error pinging  \n`);
            }
    }, 300000);
}

const errorH = async (e) => {
    var {response,request} = e;
    if (response) {
        console.log(response.status);
    }
    else if(request) {
        console.log((request.constructor.name == "Object") ? Object.keys(request) : "");
    }
    else console.log(e.message);
}

const processRes = async (r) => {
    if (r.data){
        var {data} = r;
        await dbMethods.insertBvnRec(data);
    }
    else{
        console.log(r.status);
    }
}

const verifyBvn = async (bvn) => {
    var a = axios.create({
        baseURL : "https://sterlingcamsapi.sterling.ng/api/User"
    })
    a.defaults.headers.common['ApiKey'] = "wrqewtreyrutyterewrtretre";
    a.post("/VerifyBvn",{bvn:bvn})
        .then(processRes)
        .catch(errorH);
}

//dbMethods.setup();

const handleGen = async (i,bank) => {
    var bvn =  await dbMethods.selectAndGen(i,bank);
    var bvnExists = false;
    if(bvn) {
        bvnExists = await dbMethods.bvnExists(bvn);    
        if(!bvnExists){
            verifyBvn(bvn);
        }
    }
}

const startGenBvn = async (t,bank) => {
    ping();
    for(var i =0; i<t;i++){
        await handleGen(i,bank);
        
    }
}

app.get("/ping",(req,res)=>{
    res.json({type:"success",msg:"Ping recieved"})
})

app.get("/start/bank/:bank",async (req,res)=>{
    var bank = req.params.bank;
    if(bank){
        var t = await dbMethods.totalBank(bank);
        startGenBvn(t,bank);
    }
    res.json({type:"success",msg:"running"})
})

app.get("/totalRecord",async (req,res)=>{
    res.json(await dbMethods.totalRecord())
})

app.listen(process.env.PORT||5000,(e)=>{
    if(e){
        throw e;
    }
    else console.log("bavana miner 2.2 running")
})