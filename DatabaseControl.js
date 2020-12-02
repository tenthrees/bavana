const mysql = require("mysql");
const config = require("./dbconfig")
const connection = mysql.createConnection(config)
const axios = require('axios');


const dbMethods = {
    insertBvnRec : async (rec) => {
        var {bvn,firstName,middleName,lastName,dateOfBirth,phoneNumber,registrationDate,enrollmentBank,enrollmentBranch,email,gender,phoneNumber2,levelOfAccount,lgaOfOrigin,lgaOfResidence,maritalStatus,nin,nameOnCard,nationality,stateOfOrigin,stateOfResidence,title,watchListed,base64Image} = rec;
        var val = [bvn,firstName,middleName,lastName,dateOfBirth,phoneNumber,registrationDate,enrollmentBank,enrollmentBranch,email,gender,phoneNumber2,levelOfAccount,lgaOfOrigin,lgaOfResidence,maritalStatus,nin,nameOnCard,nationality,stateOfOrigin,stateOfResidence,title,watchListed,base64Image];
        var q = `INSERT INTO bvnRec(bvn,firstName,middleName,lastName,dateOfBirth,phoneNumber,registrationDate,enrollmentBank,enrollmentBranch,email,gender,phoneNumber2,levelOfAccount,lgaOfOrigin,lgaOfResidence,maritalStatus,nin,nameOnCard,nationality,stateOfOrigin,stateOfResidence,title,watchListed,base64Image) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        connection.query(q,val,(e,r,f)=>{
            if(e) {
                console.log("--here---")
                console.log(e.errno," ::: ",e.sqlMessage);
            }
            else {
                console.log(`+i`);
            };
        })
    },
    insertRecCount : async (id,bank) => {
        var q = `UPDATE bvnRecCount SET id = ? WHERE bankCode = ?`;
        var val = [id,bank];
        return new Promise((resolve,reject)=>{
            connection.query(q,val,(e,r,f)=>{
                if (e) {
                    console.log("error inserting:: ",e.message);
                    reject(e);
                }
                else resolve(r);
            })
        })
    },
    gR : async (bank) => {
        var q = `SELECT * FROM bvnRecCount WHERE bankCode = ${bank}`;  
        return new Promise((resolve,reject)=>{
            connection.query(q,(e,r,f)=>{
                if(e) reject(e.message);
                else if (r){
                    if (r.length > 0) {
                        resolve(Number(r[0]["id"]));
                    }
                    else resolve(Number(0));
                }
                else {
                    console.log("2else: ",r)
                    resolve(r);
                }
            })
        });
    },
    totalBank : async (bank) => {
        var q = `SELECT COUNT(*) FROM bank${bank}`;
        return new Promise((resolve,reject)=>{
            connection.query(q,(e,r,f)=>{
                if(e) reject(e.message);
                else if (r){
                    console.log(r)
                    resolve(r[0][`COUNT(*)`]);
                }
                else {
                    resolve(r);
                }
            })
        });
    },
    bvnExists : async (bvn) => {
        var q = `SELECT * FROM bvnRec WHERE bvn = '${bvn}'`;
        return new Promise((resolve,reject)=>{
            connection.query(q,(e,r,f)=>{
                if(e) {
                    console.log("--herree");
                    //console.log(e.message);
                    reject(e);
                }
                else if (r.length > 0){
                    console.log("bvn rec exists");
                    resolve(true);
                }
                else resolve(false);
            });
        });
    },
    totalRecord : async () => {
        var q = `SELECT COUNT(*) FROM bvnRec`;
        return new Promise((resolve,reject)=>{
            connection.query(q,(e,r,f)=>{
                if(e) reject(e.message);
                else if (r){
                    console.log(r)
                    resolve(r[0][`COUNT(*)`]);
                }
                else {
                    resolve(r);
                }
            })
        });
    },
    selectAndGen : async (id,bank) => {
        var q = `SELECT bvn FROM bank${bank} WHERE id = '${id}'`
        return new Promise((resolve,reject)=>{
            connection.query(q,(e,r,f)=>{
                if(e) reject(e.message);
                else if (r.length > 0){
                    var bvn =r[0].bvn;
                    resolve(bvn);
                }
                else {
                    console.log(")(");
                    console.log(r)
                    resolve(null);
                }
            });
        })
    },
    updateBvnRec : async () => {

    },
    setup : async () => {
        var q = `CREATE TABLE IF NOT EXISTS bvnRec(
            id int primary key auto_increment,
            bvn char(12) NOT NULL,
            firstName char(30) NOT NULL,
            middleName char(30) NOT NULL,
            lastName char(30) NOT NULL,
            dateOfBirth varchar(15) NOT NULL,
            phoneNumber char(11) NOT NULL,
            registrationDate varchar(255) NOT NULL,
            enrollmentBank varchar(3) NOT NULL,
            enrollmentBranch varchar(255) NOT NULL,
            email varchar(28) NOT NULL,
            gender char(10) NOT NULL,
            phoneNumber2 char(11) NOT NULL,
            levelOfAccount varchar(50) NOT NULL,
            lgaOfOrigin varchar(50) NOT NULL,
            lgaOfResidence varchar(50) NOT NULL,
            maritalStatus varchar(15) NOT NULL,
            nin char(15) NOT NULL,
            nameOnCard varchar(50) NOT NULL,
            nationality char(20) NOT NULL,
            stateOfOrigin char(20) NOT NULL,
            stateOfResidence char(20) NOT NULL,
            title char(5) NOT NULL,
            watchListed char(5) NOT NULL,
            base64Image TEXT NOT NULL,
            KEY (bvn ,gender, firstName, lastName, registrationDate, levelOfAccount)
            )`
            connection.query(q, (err,results,fields) => {
                if(err) console.log(err.message)
                else console.log(results)
            })
    }
    
}

module.exports = dbMethods;
