const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const db=require('./config/config').get(process.env.NODE_ENV);
const User=require('./models/user');
const {auth} =require('./middlewares/auth');
const Product=require('./models/product');
const router = express.Router();
const Order=require('./models/order');

const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});


app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});

// adding new order
app.post('/api/order',function(req,res){
    const neworder=new Order(req.body);
    neworder.save((err,doc)=>{
        if(err) {console.log(err);
            return res.status(400).json({ success : false});}
        res.status(200).json({
            succes:true,
            user : doc
        });
    });
});

// get Order By Id
app.get('/api/order/:id',function(req,res){
    Order.findById(req.params.id).then((order => {
        if (!order) {
            return res.status(404).send({
                message: "Order not found with id " + req.params.id,
            })
        }
        res.status(200).send(order);
        console.log(order);
    }))
});

// get Order History By User Id
app.get('/api/order/history/:userid',function(req,res){
    Order.findOne({ userid: req.params.userid }).then((orderHistory => {
        if (!orderHistory) {
            return res.status(404).send({
                message: "orderHistory not found with id " + req.params.id,
            })
        }
        res.status(200).send(orderHistory);
        console.log(orderHistory);
    }))
});


// update Order Status By Id
app.put('/api/order/:id',function(req,res){

    Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).then((order => {
        if (!order) {
            return res.status(404).send({
                message: "Order not found with id " + req.params.id,
            })
        }
        res.status(200).send(order);
        console.log(order);
    }))
});

// adding new product
app.post('/api/product',function(req,res){
    const newproduct=new Product(req.body);
    newproduct.save((err,doc)=>{
        if(err) {console.log(err);
            return res.status(400).json({ success : false});}
        res.status(200).json({
            succes:true,
            user : doc
        });
    });
});

// get Product By Id
app.get('/api/product/:id',function(req,res){
    Product.findById(req.params.id).then((product => {
        if (!product) {
            return res.status(404).send({
                message: "Product not found with id " + req.params.id,
            })
        }
        res.status(200).send(product);
        console.log(product);
    }))
});

// get all Product
app.get('/api/product',function(req,res){
    Product.find().then((product => {
        res.status(200).send(product);
    }))
});

// adding new user (sign-up route)
app.post('/api/register',function(req,res){
    // taking a user
    const newuser=new User(req.body);
    
   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});
 
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                succes:true,
                user : doc
            });
        });
    });
 });

 // login user
app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
    });
});

// get logged in user
app.get('/api/profile',auth,function(req,res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname
        
    })
});

//logout user
app.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

});