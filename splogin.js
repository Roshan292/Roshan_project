const mysql=require('mysql');
const jwt=require('jsonwebtoken');
const express=require('express');
var app=express();
const bodyparser=require('body-parser');
var validate2=require('./validate2');
app.use('/validate2',validate2);
app.use(bodyparser.json());
var mysqlconnection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'mydb'
});
mysqlconnection.connect((err)=>{
    if(!err)
    console.log('db connection succeded');
    else
    console.log('db connection failed \n error:'+JSON.stringify(err,undefined,2));
});
app.listen(3000,()=>console.log('express server is running at port no : 3000'));
app.post('/register',validate2);
app.get('/login',(req,res)=>{
    mysqlconnection.query('SELECT * FROM sp WHERE name=? AND password=MD5(?)',[req.body.name,req.body.password],(err,rows,fields)=>{
        if(rows==0)
        res.send('user does not exist');
        else
        // res.send('user does not exist');
        jwt.sign({rows},'secretkey',(err,token)=>{
            res.json({
                token
            });
        });
    })
});
app.get('/',verifytoken,(req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err){
            res.sendStatus(403);
        }else{
            res.json({
                message:'post created....',
                authData
            });
        }
    });   
});
function verifytoken(req,res,next){
    const bearerheader=req.headers['authorization'];
    if(typeof bearerheader!=='undefined'){
        const bearer=bearerheader.split(' ');
        const bearertoken=bearer[1];
        req.token=bearertoken;
        next();
    }else{
        res.sendStatus(403);
    }
}
app.put('/profileupdate',(req,res)=>{
    mysqlconnection.query('UPDATE sp SET name=?,password=MD5(?),address=?,lat=?,lon=? WHERE id=?',[req.body.name,req.body.password,req.body.address,req.body.lat,req.body.lon,req.body.id],(err,rows,fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});