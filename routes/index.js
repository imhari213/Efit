var express = require('express');
var app = express();
const fs = require('fs');
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


//mail config

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'demo90111@gmail.com',
    pass: 'hari3296so'
  }
})


var db = require('../connection')

//Async/await config

var async = require('asyncawait/async');
var await = require('asyncawait/await');

//web3 config

var Web3 = require('web3');
var web3 = new Web3(
  new Web3.providers.HttpProvider('https://rinkeby.infura.io/01430c533dcd4c42bd9cc98cff3eb0a4')
);
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;

//wallet config

var address = '0x2Bf6D47F1b1Dbe57430Fcd121903bb8FdB240eA9';
var key = 'F9E619B6EF3DB1F094580F62608DF9F21C025605F62FAA9E5AC2D8133F26A1D6';


//contract config
var ABI = [{ "constant": false, "inputs": [{ "name": "tokens", "type": "uint256" }], "name": "deposit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "reciever", "type": "address" }, { "name": "t", "type": "uint256" }], "name": "returnTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_address", "type": "address" }, { "name": "_age", "type": "uint256" }, { "name": "_goal", "type": "uint256" }, { "name": "_status", "type": "uint256" }], "name": "setInstructor", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "afs", "type": "address" }, { "name": "st", "type": "uint256" }], "name": "up", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "personaddr", "type": "address" }, { "name": "steps", "type": "uint256" }], "name": "updatestatus", "outputs": [{ "name": "", "type": "string" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "contractbalance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "countInstructors", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_address", "type": "address" }], "name": "getInstructor", "outputs": [{ "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getInstructors", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "personAccts", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }]
var contractAddress = '0x4a7542d1ea6fd49ac583ae4a715c88f6865d98cc';
var contract = new web3.eth.Contract(ABI, contractAddress);
var store;


//sendSignedTRansaction method

function sendRaw(rawTx, callback) {
  console.log("In method")
  var privateKey = new Buffer(key, 'hex');
  var transaction = new tx(rawTx);
  transaction.sign(privateKey);
  var serializedTx = transaction.serialize();

  console.log(serializedTx);
  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, result) {
    if (err) {
      console.log(err);
    } else {
      store = result;
      console.log(store);
      callback(result);
    }
  }).then((result) => {
    console.log(result);

  })
}



app.post('/adduser', async (req, res, next) => {

  //INSERT INTO `Efit`.`users` (`email`, `username`) VALUES ('imhat', 'uhnh');

  await db.query('INSERT INTO `Efit`.`users` (`email`, `username`) VALUES ("' + req.body.email + '","' + req.body.username + '")', function (err, result) {
    if (err) throw err;
    else
      console.log(result);
    res.send("user Added successfully");
  });
});


app.post('/setgoal', async (req, res, next) => {


  await db.query('UPDATE `Efit`.`users` SET goal="' + req.body.goal + '",walletid="' + req.body.walletid + '",Age="' + req.body.age + '" WHERE email="' + req.body.email + '"', function (err, result) {
    if (err) throw err;
    else
      console.log(result);
    // res.send("Goal Established");
  });



  var n = async function m() {
    var x = await web3.eth.getTransactionCount(address)
    txOptions = {
      chainId: 4,
      nonce: await web3.utils.toHex(x),
      gasLimit: await web3.utils.toHex(5000000),
      gasPrice: await web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
      to: contractAddress
    }


    var rawTx = txutils.functionTx(ABI, 'setInstructor', [req.body.walletid, req.body.age, req.body.goal, 0], txOptions);
    console.log(rawTx);
    var s = await sendRaw(rawTx, async (result, err) => {
      if (err) {
        res.send(err);
      }
      else {
        console.log(result);
        //mail sent to the user regarding successfull registration
        var mailoptions = {
          from: 'dummytest471@gmail.com',
          to: req.body.email,
          subject: 'Succesfully Registered',
          text: 'Hi You are succesfully registered with E-Fit Thank you for registering with us.....!!!!!!! :) And please save this reference no for future purpose  ' + result

        }

        await transporter.sendMail(mailoptions, function (err, info) {
          if (err) {
            console.log(err);
            res.send({ "status": "0", "message": "failed.....!" });
          }
          else {

            res.send({ "status": "1", "message": "Successfully Registered" });

          }
        })

      }

    });



  }



  n();


});


app.post('/claim', async (req, res, next) => {

  //UPDATE `Efit`.`users` SET `status`='100' WHERE `id`='2';

  
  await db.query('UPDATE `Efit`.`users` SET status="' + req.body.steps + '"', function (err, result) {
    if (err) throw err;
    else
      console.log(result);
    // res.send("Goal Established");
  });



  var m = async function m() {
    var x = await web3.eth.getTransactionCount(address)
    txOptions = {
      chainId: 4,
      nonce: await web3.utils.toHex(x),
      gasLimit: await web3.utils.toHex(5000000),
      gasPrice: await web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
      to: contractAddress
    }


    var rawTx = txutils.functionTx(ABI, 'updatestatus', [req.body.walletid, req.body.steps], txOptions);
    console.log(rawTx);
    var s = await sendRaw(rawTx, async (rev, err) => {
      if (err) {
        res.send(err);
      } else {

        console.log(rev + "transaction Hash");

        var hash = rev;

        //db Check


        await db.query('SELECT goal,status FROM Efit.users where walletid="' + req.body.walletid + '";', async (err, result) => {
          if (err) {
            res.send(err);
          } else {
            console.log(result);
            console.log("***********************");
            var r = result[0];
            goal = r.goal;
            status = r.status;
            console.log(goal + "Goal*****");
            console.log(status + "status*****");
            if (status >= goal) {

              //mail sent to the user regarding Token
              var mailoptions = {
                from: 'dummytest471@gmail.com',
                to: req.body.email,
                subject: 'Token Recieved',
                text: 'For the successfull completion of GOal you have recieved a EToken Please Check your Wallet For More Information   ' + hash

              }

              await transporter.sendMail(mailoptions, function (err, info) {
                if (err) {
                  console.log(err);
                  res.send({
                    "status": "0",
                    "message": "failed.....!"
                  });
                } else {

                  res.send({
                    "status": "1",
                    "message": "Successfully Updated"
                  });

                }
              })



            } else {

              res.send(result);

            }

          }
        });


      }

    });



  }

  m();







});






module.exports = app;
