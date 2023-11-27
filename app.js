const express = require('express')
const app = express()
const morgan = require('morgan')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const router = express.Router();
const cors = require('cors');



app.use(cors());
app.options('*',cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('./public'))
app.use(morgan('short'))


//changes
var admin = require("firebase-admin");
var serviceAccount = require("./imigration-33d7d-firebase-adminsdk-l19d2-6dd1e00f00.json"); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://imigration-33d7d-default-rtdb.firebaseio.com/" // Replace with your Firebase Realtime Database URL or Firestore URL
  });
  
  const db = admin.database(); // For Realtime Database








//Testing

app.post("/users/create", (req, res) => {
    console.log("Creating new user data:");
    const username = req.body.username;
    const password = req.body.password;
    const mobile = req.body.mobile;
    const email = req.body.email;
    
    console.log(req.body.username);
    

    const usersRef = db.ref("users");
    // Generate a unique key for the new user
    const newUserRef = usersRef.push();
  
    // Set the user data at the generated key
    newUserRef.set({
      username: username,
      password: password,
      mobile: mobile,
      email: email,
    }, (error) => {
      if (error) {
        console.log("Error creating user: " + error);
        res.sendStatus(500);
      } else {
        const userId = newUserRef.key;
        console.log("Creating new user with UID: " + userId);
        res.redirect("./public/create_key.html");
      }
    });
  });






  app.post("/keys/create", (req, res) => {
    console.log("Creating new key data:");
    const accId = req.body.accId;
    const accName = req.body.accName;
    const license = req.body.license;
    const expiry = req.body.expiry + " 23:59:59";
  
    console.log(accId);
    console.log(accName);
    console.log(license);
    console.log(expiry);
    console.log("user uid: " + userId);
  
    // Reference to the "keys" node in your Firebase Realtime Database
    const keysRef = db.ref("keys");
  
    // Generate a unique key for the new key data
    const newKeyRef = keysRef.push();
  
    // Set the key data at the generated key
    newKeyRef.set({
      user_uid: userId,
      account_id: accId,
      account_name: accName,
      license: license,
      expiry_date: expiry,
    }, (error) => {
      if (error) {
        console.log("Error creating key: " + error);
        res.sendStatus(500);
      } else {
        console.log("Creating new key");
        const keyId = newKeyRef.key;
        console.log("Insert status key ID: " + keyId);
        res.end();
      }
    });
  });



app.get("/", (req, res) => {
    console.log("this is a get on root..")
    res.send("Helloooo there this is a test")
})

  

app.post("/keys/validate/:accId/:key", (req, res) => {
    const accId = req.params.accId;
    const key = req.params.key;
  
    // Reference to the "keys" node in your Firebase Realtime Database
    const keysRef = db.ref("keys");
  
    keysRef.once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          let keyData = null;
  
          // Loop through the child keys within the "keys" node
          snapshot.forEach((childSnapshot) => {
            const childKey = childSnapshot.key;
            const childData = childSnapshot.val();
            console.log(childData);
            console.log(req.params.accId);
            console.log(req.params.key);
            // Check if the "license" data matches the provided key
            if (childData.license === key && childData.account_id === accId) {
              keyData = childData;
              return true; // Exit the loop once a matching key is found
            }
          });
  
          if (keyData) {
            const keyStatus = keyData.status;
            const expiryDate = keyData.expiry_date;
            res.json({ keyStatus, license: key, expiryDate });
          } else {
            console.log("Key not found for the specified accId");
            res.status(404).json({ error: "Key not found for the specified accId" });
          }
        } else {
          console.log("Key not found for the provided key");
          res.status(404).json({ error: "Key not found for the provided key" });
        }
      })
      .catch((error) => {
        console.error("Error for validating key: " + error);
        res.sendStatus(500);
      });
  });
  
// get all users
  app.get("/users/all", (req, res) => {
    console.log("runing!");
    const usersRef = db.ref("users");
  
    usersRef
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = [];
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            const user = {
              username: userData.username,
              status: userData.status,
              email: userData.email,
              cellPhone: userData.mobile,
            };
            users.push(user);
          });
          res.json(users);
        } else {
          console.log("No users found in the database");
          res.status(404).json({ error: "No users found in the database" });
        }
      })
      .catch((error) => {
        console.error("Error fetching users: " + error);
        res.status(500).json({ error: "Error fetching users" });
      });
  });
  
  
  app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    const usersRef = db.ref("users");
  
    usersRef
      .child(userId)
      .once("value")
      .then((snapshot) => {
        const userData = snapshot.val();
  
        if (userData) {
          const user = {
            username: userData.username,
            email: userData.email,
            mobile: userData.mobile,
            password: userData.password,
          };
          res.json(user);
        } else {
          console.log("User not found in the database");
          res.status(404).json({ error: "User not found in the database" });
        }
      })
      .catch((error) => {
        console.error("Error fetching user: " + error);
        res.status(500).json({ error: "Error fetching user" });
      });
  });
  


  

app.listen(3003, () => {
    console.log("server is up and running...")
})