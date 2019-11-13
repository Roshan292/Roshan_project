var Joi=require("joi");
var mysql=require('mysql');
var mysqlconnection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'mydb'
});
var validate3 = function validate(req,res,next)
{
console.log(req.body)
const schema = Joi.object().keys({
name: Joi.string().min(3).max(30).required(),
password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
address:joi.string().min(5).max(30).required(),
lat:Joi.string().regex(/^[-+]?[0-9]+\.[0-9]+$/),
lon:Joi.string().regex(/^[-+]?[0-9]+\.[0-9]+$/)
})
console.log(req.body);
Joi.validate(req.body, schema, function (err, value)
{
if(err)
{
console.log(req.body)
return res.send("Error Occured"+err)
}
else
    mysqlconnection.query('INSERT INTO admin (name,password) VALUES (?,MD5(?))',[req.body.name,req.body.password],(err,rows,fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
});
});
}
module.exports = validate3;