var express=require("express");
var app=express();
var bodyparser=require("body-parser");
var mysql=require("mysql");
var urlencodedParser = bodyparser.urlencoded({ extended: false });
var request=require("request");
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.static("img"));
var pool=mysql.createPool({
    host:"127.0.0.1",
    user:"akarmalkar",
    password:"",
    database:"c9"
});
app.get("/",function(req,res){
pool.getConnection(function(err,con){
   if(err) throw err;
   console.log("Connection Established");
   var sql="select poster from tbl_movies where city='Bhopal' order by id desc limit 3";
   con.query(sql,function(err,result){
      con.release();
      if(err) throw err;
      console.log(result);
      res.render("index.ejs",{resultVar:result[0].poster,
            resultVar2:result[1].poster,
            resultVar3:result[2].poster
         });
      }); 
   });
});
app.post("/:city",urlencodedParser,function(req,res){
      var cty=req.body.city;
      var sql="select poster from tbl_movies where city=? order by id desc limit 3";
      pool.query(sql,[cty],function(err,result){
         if(err) throw err;
         console.log(result);
         res.render("index.ejs",{
         resultVar:result[0].poster,
         resultVar2:result[1].poster,
         resultVar3:result[2].poster
         });
      });
   });
app.get("/search",function(req,res){
   var movie=req.query.search;
   var url="http://omdbapi.com/?s="+movie+"&apikey=thewdb";
   request(url,function(err,res,body){
      if(!err && res.statusCode==200){
      var data=JSON.parse(body);
      for(var i=0;i<Object.keys(data).length;i++){
      console.log(data.Search[i].Title);
      }
      }
   });
});   
app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server Started"); 
});