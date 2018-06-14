const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const User = require('./models/user');
const users = require('./routes/api');
// const config = require('./config/database');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://username:password@ds127139.mlab.com:27139/bookstore')
  .then(res => console.log("connected to database"))
  .catch(err => console.log(err.message));
// mongoose.connect('mongodb://username:password@ds127139.mlab.com:27139/bookstore', (err)=>{
//     if(err) console.log(err.message);
//     else console.log('connected to database');	
// });

const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENVIRONMENT;

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// app.use(passport.initialize());
// require('./config/passport')(passport);

app.use('/api', users);

// app.get('/', (req, res)=>{
// 	res.send('invalid endpoint')
// })



app.get('*', (req, res)=>{
  if(environment == 'PROD'){
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  }else{
    res.send('res');
  }
});

app.listen(port, ()=>{
	console.log(`App running on port ${port}`);
});
