var express=require("express");
var app=express();
var bodyparser=require("body-parser");
var mysql=require("mysql");
var urlencodedParser = bodyparser.urlencoded({ extended: false });
var request=require("request");
var session=require("express-session");
app.use(session({secret: 'ssshhh', resave: 'true', saveUninitialized: 'true'}));
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.static("img"));
var pool=mysql.createPool({
    host:"127.0.0.1",
    user:"akarmalkar",
    password:"",
    database:"c9"
});
var sess;
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
      sess=req.session;
      var cty=req.body.city;
      sess.city=req.body.city;
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
   request(url,function(err,response,body){
      if(!err && response.statusCode==200){
      var data=JSON.parse(body);
      res.render("movie-database.ejs",{dataVar:data});
      var len=Object.keys(data.Search);
      for(var i=0;i<len.length;i++){
         console.log(data.Search[i].Title);
         }
      }
   });
});
app.get("/:city/movies",function(req, res) {
   sess=req.session;
   var sql="select poster from tbl_movies where city=? order by id desc";
   pool.query(sql,[sess.city],function(err,result){
      if (err) throw err;
      console.log(result);
      res.render("movies.ejs",{resultVar:result})
   });
});
app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server Started"); 
});