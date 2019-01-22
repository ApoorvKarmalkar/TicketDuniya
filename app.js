var express=require("express");
var app=express();
var bodyparser=require("body-parser");
var mysql=require("mysql");
var urlencodedParser = bodyparser.urlencoded({ extended: false });
var request=require("request");
var session=require("express-session");
var bcrypt=require("bcrypt");
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
var sess,sess2;
app.get("/",function(req,res){
   sess2=req.session;
pool.getConnection(function(err,con){
   if(err) throw err;
   console.log("Connection Established");
   var sql="select poster from tbl_movies where city='Bhopal' order by id desc limit 3";
   con.query(sql,function(err,result){
      con.release();
      if(err) throw err;
      console.log(result);
      if(!sess2){
         
      res.render("index.ejs",{resultVar:result[0].poster,
            resultVar2:result[1].poster,
            resultVar3:result[2].poster
         });
      }
      else {
         res.render("index.ejs",{resultVar:result[0].poster,
            resultVar2:result[1].poster,
            resultVar3:result[2].poster,
            sessLogin:sess2.name
         });
      }
      
      }); 
   });
});
app.post("/:city",urlencodedParser,function(req,res){
      sess=req.session;
      sess2=req.session;
      var cty=req.body.city;
      sess.city=req.body.city;
      var sql="select poster from tbl_movies where city=? order by id desc limit 3";
      pool.query(sql,[cty],function(err,result){
         if(err) throw err;
         console.log(result);
         res.render("index.ejs",{
         resultVar:result[0].poster,
         resultVar2:result[1].poster,
         resultVar3:result[2].poster,
         sessLogin:sess2.name
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
   sess2=req.session;
   var sql="select poster from tbl_movies where city=? order by id desc";
   pool.query(sql,[sess.city],function(err,result){
      if (err) throw err;
      console.log(result);
      res.render("movies.ejs",{resultVar:result,sessLogin:sess2.name});
   });
});
app.post("/user/signup",urlencodedParser,function(req,res){
   var fname=req.body.fname;
   var lname=req.body.lname;
   var mobile=req.body.mobile;
   var email=req.body.email;
   var pass=req.body.password;
      bcrypt.hash(pass,10,function(err,hash){
         var sql="insert into tbl_users(first_name,last_name,mobile,email,password) values('"+fname+"','"+lname+"','"+mobile+"','"+email+"','"+hash+"')";
         pool.query(sql,function(err, result) {
         if (err) throw err;
         console.log("Records inserted");
         res.render("regsuccess.ejs");
         });
      });
});
app.post("/user/login",urlencodedParser,function(req,res){
   var mobile=req.body.mobile;
   var pass=req.body.password;
   var hash="select password from tbl_users where mobile='"+mobile+"'";
   sess2=req.session;
   pool.query(hash,function(err1, hresult) {
      if(err1) throw err1;
      hresult = hresult[0].password;
      console.log(hresult);
         bcrypt.compare(pass,hresult,function(error,results){
            console.log(results);
      if(results==true){
         var sql="select first_name from tbl_users where mobile='"+mobile+"' and password='"+hresult+"'";
         pool.query(sql,function(err2, result) {
         if(err2) throw err2;
         console.log(result);
         if(result.length==1){
         console.log("Login Successful");
         sess2.name=result[0].first_name;
         res.redirect("/");
         }
         });
      }
      else
      {
         console.log("Login Failed");
      }
   });
   });
}); 

app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server Started"); 
});
