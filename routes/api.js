const express = require('express');
const router = express.Router();
// const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const nodemailer = require('nodemailer');

const environment = process.env.NODE_ENVIRONMENT;

const key = "PrivateKey";
const tokenExp = '1800s';
const hurl = 'http://localhost:4200' || 'http://localhost:3000/api' ||'';


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    // auth:{
    //     user: '',
    //     pass: ''
    // },
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

//User Registration...
router.post('/users', (req, res)=>{
	let user = new User({
		name: req.body.name,
		username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        temptoken: jwt.sign({username:req.body.username, email: req.body.email}, key, {expiresIn: 604800})
    });
    //const eurl = `${req.protocol}://${req.headers.host}/confirmation/${user.temptoken}`;
    //const eurl = `${hurl}/confirmation/${user.temptoken}`;
    //console.log(req.protocol , " ", req.headers.host, " ", req.get('Host'), " ", req.hostname);
    const eurl = (environment == 'PROD') ? `${req.protocol}://${req.headers.host}/confirmation/${user.temptoken}` : `${hurl}/confirmation/${user.temptoken}`;
    if(validateRegister(user)){
        user.save((err, callback)=>{
            if (err) {
                if(err.message.includes('duplicate')) 
                    res.json({success: false, msg: 'User already registered, please try new one'});
                else res.json({success: false, msg: 'Failed to register user, please try again'});    
            }
            else{
                transporter.sendMail({
                    to: user.email,
                    subject: 'Confirm Your E-mail',
                    text: `Please click here to confirm your email: <a href="${eurl}" target="_blank"> ${eurl} </a>`,
                    html: `Please click here to confirm your email: <a href="${eurl}" target="_blank"> ${eurl} </a>`
                });
                res.json({success: true, msg: 'Registered Successfully, please check your email for activation link'});
            } 
        });  
    }else res.json({success: false, msg: 'Insert all the valid fileds'});
});

//User Login....
router.post('/login', (req, res)=>{
	let user = new User({
		username: req.body.username,
        password: req.body.password
    });
     if(user.username == undefined || user.username =="" || user.password == undefined || user.password == ""){
        res.json({success: false, msg: 'Insert all the valid fileds'});
    }else {
        User.getUserByUserName(user.username, (err, userX)=>{
            if(err) res.status(403).json({success: false, msg: err.codeName});
            if(!userX) {
                return res.json({success: false, msg: 'User Not Found'});
            }
            User.comparePassword(user.password, userX.password, (err, isMatch)=>{
                if(err) res.status(403).json({success: false, msg: err.codeName});
                if(isMatch){
                    const token = jwt.sign({userX}, key, {expiresIn: tokenExp}, (err, token)=>{
                        res.json({
                            success: true,
                            token: 'JWT '+token,
                            user:{
                                id : userX._id,
                                name: userX.name,
                                username: userX.username,
                                email: userX.email,
                                permission: userX.permission
                            }
                        });
                    });                    
                }else{
                    return res.json({success: false, msg: 'Wrong Password'});
                }
            });
        });
    } 
});     // End of the login post

//Resend Activation Link
router.get('/resendconfirmation/:email', (req, res)=>{
    User.findOne({email: req.params.email}, (err, user)=>{
        //gen new token save and send, findOneAndUpdate
        if(err) res.json({success: false, msg: err.codeName});
        else if(user == null){
            res.json({success: false, msg: 'Email not registered, please register or provide correct Email'});
        }else{
            const token = jwt.sign({username:user.username, email: user.email}, key, {expiresIn: 604800}, (err, token)=>{
                if(err){
                    res.json({success: false, msg: 'Something Went Wrong, Please Try Again Later'});
                }else{
                    //const eurl = `${hurl}/confirmation/${token}`;
                    //const eurl = `${req.protocol}://${req.headers.host}/confirmation/${token}`;
                    const eurl = (environment == 'PROD') ? `${req.protocol}://${req.headers.host}/confirmation/${token}` : `${hurl}/confirmation/${token}`;
                    User.findOneAndUpdate({email: req.params.email}, {$set:{temptoken:token}}, {new: true}, (err, user)=>{
                        if(user == null) {
                            res.json({success: false, msg: 'User Not Registered, Please Register Yourself'});
                        }else if(err) {
                            res.json({success: false, msg: 'Something Went Wrong, Please Try Again Later'});
                        }else{
                            transporter.sendMail({
                                to: user.email,
                                subject: 'Confirm Your E-mail',
                                text: `Please click here to confirm your email: <a href="${eurl}" target="_blank"> ${eurl} </a>`,
                                html: `Please click here to confirm your email: <a href="${eurl}" target="_blank"> ${eurl} </a>`
                            });  
                            res.json({success: true, msg: 'Confirmation Link Sent, please check your email for activation link'});
                        }
                    });
                }
            });
        } 
      });
  });

  //Confirm Activation Token
router.get('/confirmation/:token', (req, res)=>{
    jwt.verify(req.params.token, key, (err, data)=>{
        if(err) {
            res.json({success: false, msg: 'Bad Token, Please Resend Your Confirmation Link'});
          }else{
            User.findOne({temptoken: req.params.token}, (err, user)=>{
                if(err || user == null) {
                    res.json({success: false, msg: 'Token Expired, Please Resend Your Confirmation Link'});
                  }else{
                    User.findOneAndUpdate({username: data.username}, {$set:{active:true}}, {new: true}, (err, user)=>{
                        if(user == null) {
                            res.json({success: false, msg: 'User Not Registered, Please Register Yourself'});
                        }else if(err) {
                            res.json({success: false, msg: 'Registration Token Not Verified'});
                        }else{
                            res.json({success: true, msg: "Registration Token Verified, Please Log In", user: user});
                        }
                    });
                  }
            });
          }
    });    
});

//Check Whether the Account is Activated
router.get('/checkactivateduser/:username', (req, res)=>{
    User.findOne({username: req.params.username}, (err, user)=>{
        if(err) {
            res.json({success: false, msg: 'UserName Does Not Exists'});
          }else if(user == null){
            res.json({success: false, msg: 'UserName Does Not Exists'});
          }
          else if(!user.active){
            res.json({success: false, msg: 'Account Not Activated, Please Check Your Email To Active Your Account'});
          }else{
            res.json({success: true, msg: "Active Account, Please Log In", user: user});
          }
    });    
});

//Reset password
router.post('/reset', (req, res)=>{
    User.findOne(req.body, (err, user)=>{
        //console.log("err :", err, "user :", user);
        if(err) res.json({success: false, msg: err.codeName});
        else if(user == null){
            let uid = JSON.stringify(req.body).substring(1, JSON.stringify(req.body).indexOf(":")); 
            uid = uid.charAt(0).toUpperCase() + uid.slice(1);
            res.json({success: false, msg: `${uid} not registered, please register or provide correct ${uid}`});
        }else{
            const token = jwt.sign({username:user.username, email: user.email}, key, {expiresIn: 604800}, (err, token)=>{
                if(err){
                    res.json({success: false, msg: 'Something Went Wrong, Please Try Again Later'});
                }else{
                    //const eurl = `${hurl}/new/${token}`;
                    //const eurl = `${req.protocol}://${req.headers.host}/new/${token}`;
                    const eurl = (environment == 'PROD') ? `${req.protocol}://${req.headers.host}/new/${token}` : `${hurl}/new/${token}`;
                    User.findOneAndUpdate(req.body, {$set:{temptoken:token}}, {new: true}, (err, user)=>{
                        if(user == null) {
                            res.json({success: false, msg: 'User Not Registered, Please Register Yourself'});
                        }else if(err) {
                            res.json({success: false, msg: 'Something Went Wrong, Please Try Again Later'});
                        }else{
                            transporter.sendMail({
                                to: user.email,
                                subject: 'Confirm Your E-mail',
                                text: `Please click here to cotinue with your password reset: <a href="${eurl}" target="_blank"> ${eurl} </a>`,
                                html: `Please click here to cotinue with your password reset: <a href="${eurl}" target="_blank"> ${eurl} </a>`
                            });  
                            res.json({success: true, msg: 'Password Reset Link Sent, please check your email for the link'});
                        }
                    });
                }
            });
        } 
      });
  });

  //Confirm Password Reset Token
  router.get('/newpassword/:token', (req, res)=>{
    jwt.verify(req.params.token, key, (err, data)=>{
        if(err) {
            res.json({success: false, msg: 'Bad Token, Please Resend Your Password Reset Link'});
          }else{
            User.findOne({temptoken: req.params.token}, (err, user)=>{
                if(err || user == null) {
                    res.json({success: false, msg: 'Token Expired, Please Resend Your Password Reset Link'});
                  }else{
                    res.json({success: true, msg: "Please Enter Your New Password", user: user});
                  }
            });
          }
    });    
});  

//Set New Password
router.put('/setnewpwd/:id', (req, res)=>{
    // has pwd, save pwd
    User.hashPassword(req.body.password, (err, pwd)=>{
        if(err || pwd == null) res.json({success: false, msg: 'Something Went Wrong, Please Try Again Later'});
        else{
            User.findByIdAndUpdate(req.params.id, {$set:{password: pwd}}, {new: true}, (err, user)=>{
                if(user == null || err) {
                    res.json({success: false, msg: 'User Not Found, Please Register Yourself'});
                }else{
                    res.json({success: true, msg: "Registration Token Verified, Please Log In", user: user});
                }
            });
        }
    });    
  });

//verify profile....
router.post('/profile', verifyToken, (req, res)=>{
    jwt.verify(req.token, key, (err, authData)=>{
        if(err) res.status(403).json({success: false, msg: "Token Invalid"});
        else{
            User.findById(authData.userX._id, (err, user)=>{
                if(err) res.status(403).json({success: false, msg: err.codeName});
                res.json({success: true, msg: "Token Verified", user: user, exp: authData.exp});
              });
        } 
        /*res.json({success: true, msg: "Token Verified", user: authData.userX});*/    
    });    
});

router.put('/profile/:id', (req, res)=>{
    User.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true}, (err,user)=>{
      if(err) {
          res.status(403).json({success: false, msg: err.codeName=='DuplicateKey'? 'UserId Not Available Please Try Another One': err.codeName});
        }
      res.json(user);
    });
    // .findBfindByIdAndUpdateyId(req.params.id, {$set: req.body}, {})
    // .exec((err, user)=>{
    //     if(err) throw err;
    //     res.json(user);
    // });
  });

  router.get('/user/permission/:id', (req, res)=>{
    User.findOne({username: req.params.id}, (err, user)=>{
        if(err) res.json({success: false, msg: err.codeName});
        else res.json({success: true, msg: "user permission", permission: user.permission});
      });
  });


router.post('/getusers', (req, res)=>{
    User.find({username: req.body.username}, (err, user)=>{
        if(err  || user.length<=0) {
            res.json({success: false, msg: "Authorization Restrictred"});
        }else{
            if(user[0].permission == 'admin' || user[0].permission == 'moderator'){
                User.find({})
                    .exec((err, users)=>{
                        if(err) res.json({success: false, msg: "Authorization Restrictred", permission: user.permission});
                        res.json({success: true, msg: "All users", users: users});
                    });
            }else{
                res.json({success: false, msg: "Authorization Restrictred", permission: user[0].permission});
            }
        }
      });
  });

  router.post('/deleteuser/:id', (req, res)=>{
    User.find({username: req.body.username}, (err, user)=>{
        if(err  || user.length<=0) {
            res.json({success: false, msg: "Authorization Restrictred"});
        }else{
            if(user[0].permission == 'admin'){
                User.findByIdAndRemove(req.params.id, (err,user)=>{
                    if(err) res.json({success: false, msg: "Authorization Restrictred"});
                    res.json({success: true, msg: `User deleted of ID : ${req.params.id}`, user: user});
                });
            }else{
                res.json({success: false, msg: "Authorization Restrictred", permission: user[0].permission});
            }
        }
      });
  });
  
router.get('/users/:id', (req, res)=>{
    User.findById(req.params.id, (err, user)=>{
        if(err) res.json({success: false, msg: "user not found, please try again"});
        res.json({success: true, msg: "user details found", user: user});
      });
  });

router.delete('/profile/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id, (err,user)=>{
      if(err) res.status(403).json({success: false, msg: err.codeName});
      res.json(user);
    });
});


//functions
function verifyToken(req, res, next){
    const tokenHeader = req.headers['authorization'];
    if(tokenHeader != undefined) {
        req.token = tokenHeader;
    }else{
        res.status(403).json({success: false, msg: "No Auth Heared Found"});
    }
    next();
}

//User Extend Login....
router.post('/extendlogin', (req, res)=>{
    jwt.verify(req.body.token, key, (err, data)=>{
        if(err) {
            res.json({success: false, msg: 'Session Expired, Please Login Again'});
          }else{
            User.getUserByUserName(data.userX.username, (err, userX)=>{
                if(err || !userX) return res.json({success: false, msg: 'Session Expired, Please Login Again'});
                else{
                    const token = jwt.sign({userX}, key, {expiresIn: tokenExp}, (err, token)=>{
                        res.json({
                            success: true,
                            token: 'JWT '+token,
                            user:{
                                id : userX._id,
                                name: userX.name,
                                username: userX.username,
                                email: userX.email,
                                permission: userX.permission
                            }
                        });
                    });   
                }
                
            });
          }
    }); 
});     // End of the Extend login post

validateRegister = (user)=>{
    if(user.name == undefined || user.username == undefined || user.email == undefined || user.password == undefined || !validateEmail(user.email) ){
      return false;
    }else{
      return true;
    }
};

validateEmail = (email)=>{
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

module.exports = router;