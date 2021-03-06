const axios = require('axios')
const express = require('express');
const dbMethods = require('./DatabaseControl');

const app = express();

app.use(require('body-parser')());
app.use(express.static(__dirname+"/public"))
app.set('views',__dirname+"/views")
app.set('view engine', 'pug');

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
//test deploy
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
            dbMethods.insertRecCount(i,bank);
        }
    }
}

const startGenBvn = async (t,bank) => {
    ping();
    for(var i =0; i<t;i++){
        await handleGen(i,bank);
    }
}

const startFromGenBvn = async (recCount,t,bank) => {
    ping();
    for(var i = recCount; i<t;i++){
        await handleGen(i,bank);
        await dbMethods.insertRecCount(i,bank);
    }
}
var reply = [
    "id",
    "bvn",
    "firstName",
    "middleName",
    "lastName",
    "dateOfBirth",
    "phoneNumber",
    "registrationDate",
    "enrollmentBank",
    "enrollmentBranch",
    "email",
    "gender",
    "phoneNumber2",
    "levelOfAccount",
    "lgaOfOrigin",
    "lgaOfResidence",
    "maritalStatus",
    "nin",
    "nameOnCard",
    "nationality",
    "stateOfOrigin",
    "stateOfResidence",
    "title",
    "watchListed",
    "base64Image"
]

app.get("/bvn/:bvn" , async (req,res) => {
    var {bvn} = req.params;
    var a = axios.create({
        baseURL : "https://sterlingcamsapi.sterling.ng/api/User"
    })
    a.defaults.headers.common['ApiKey'] = "wrqewtreyrutyterewrtretre";
    try{
        var _req = await a.post("/VerifyBvn",{bvn:bvn});
        res.json(_req.data);
    }
    catch(e){
        res.json("Error")
    }
})

app.get("/gui",async (req,res)=>{
    var max = await dbMethods.totalRecord();
    var rand = Math.round(max * Math.random(max - 1));
    var record = await dbMethods.getById(rand);
    res.render("gui-basic",{record : record, total : max, reply : reply})
})

app.get("/gui-more:id",async (req,res)=>{
    var {id} = req.params;
    var record = await dbMethods.getById(id);
    res.render("gui-more",{record:record});
})

app.post("/s", async (req,res)=>{
    var {query} = req.body;
    if(query){
        if(query[0] == "*") res.json(await dbMethods.searchQ(query));
        else res.json({type:"error",msg:"Invalid query"});
    }
    else res.json({type:"error",msg:"No query"});
})

app.get("/getEmails/:qty" , async (req,res) => {
    var {qty} = req.params;
    var records = await dbMethods.getEmailsQty(qty);
    res.json(records);
})

app.get("/getBasicInfo/:qty", async (req,res) => {
    var {qty} = req.params;
    var records = await dbMethods.getBasicInfo(qty);
    res.json(records);
})

app.post("/getEmailsFrom/:_this/to/:that", async (req,res) => {

})

app.post("/search",async (req,res)=>{
    var searchQuery = req.body;
    if (searchQuery) {
        var t = new RegExp(" in ");
        if(t.test(searchQuery)){
            var [word,where] = searchQuery.split(" in ");
            var searchResult = dbMethods.searchIn(word,where);
            res.json(searchResult);
        }
        else {
            res.json(["Search query invalid"]);
        }
    }
    else{
        res.json(["No search query specified"]);
    }
})



app.get("/search=:q", async (req,res) => {
    var {q} = req.params;
    var searchResult ;
    if (q) {
        var t = new RegExp(" in ");
        if(t.test(q)){
            var [word,where] = q.split(" in ");
            console.log(searchResult)
            searchResult = await dbMethods.searchIn(word,where);
            console.log("FF  : ",searchResult)
        }
        else {
            searchResult = ["Search query invalid"];
        }
    }
    else{
        searchResult = ["No search query specified"];
    }
    console.log(searchResult)
    res.render("search", {query : q,searchResult :searchResult});
})

app.get("/ping",(req,res)=>{
    res.json({type:"success",msg:"Ping recieved"})
})

app.get("/start/bank/:bank",async (req,res)=>{
    var bank = req.params.bank;
    if(bank){
        var recCount = await dbMethods.gR(bank);
        var t = await dbMethods.totalBank(bank);
        
        if(recCount > 0){
            startFromGenBvn(recCount,t,bank)
        }
        else startGenBvn(t,bank);
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