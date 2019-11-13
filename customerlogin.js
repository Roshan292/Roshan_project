const mysql=require('mysql');
const jwt=require('jsonwebtoken');
const express=require('express');
var app=express();
const bodyparser=require('body-parser');
var validate1=require('./validate1');
app.use('/validate1',validate1);
app.use(bodyparser.json());
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./customer.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
app.post('/register',validate1);
app.post('/login',(req,res)=>{
    mysqlconnection.query('SELECT * FROM cust WHERE name=? AND password=MD5(?)',[req.body.name,req.body.password],(err,rows,fields)=>{
        if(rows==0)
        res.send('user does not exist');
        else
        jwt.sign({rows},'secretkey',(err,token)=>{
            res.json({
                token
            });
        });
        // res.send(rows);
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
app.put('/login',(req,res)=>{
    mysqlconnection.query('UPDATE customers SET address=?,lat=?,lon=? WHERE id=?',[req.body.address,req.body.lat,req.body.lon,req.body.id],(err,rows,fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});
app.get('/searchsp/:id',(req,res)=>{
    mysqlconnection.query('SELECT cust.name AS customer, sp.name AS Service, 3956 * 2 * ASIN(SQRT(POWER(SIN((cust.lat - abs(sp.lat)) * pi()/180 / 2), 2) +  COS(cust.lat * pi()/180 ) * COS(abs(sp.lat) * pi()/180) *  POWER(SIN((cust.lon - sp.lon) * pi()/180 / 2), 2) )) AS distance FROM cust JOIN sp ON cust.address = sp.address WHERE cust.id=? HAVING distance < 5 ORDER BY distance DESC',[req.params.id],(err,rows,fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});
app.put('/profileupdate',(req,res)=>{
    mysqlconnection.query('UPDATE cust SET name=?,password=MD5(?) WHERE id=?',[req.body.name,req.body.password,req.body.id],(err,rows,fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});