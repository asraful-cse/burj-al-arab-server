
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

require('dotenv').config()
console.log(process.env.DB_PASS);
// for security part......
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.85cmi.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000

const app = express()
app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require("./configs/burj-al-arab-projects-firebase-adminsdk-xdk4d-30e2e0d320.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  //  console.log('DB cONNEcTiON sUcCESS');
  //   client.close();

  // // for create .. ... ... 
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        // console.log(result);
        res.send(result.insertedCount > 0);
      })
    // console.log(newBooking);
  })

  // /// for red .. ... ... 
  app.get('/bookings', (req, res) => {
    // console.log(req.query.email);
    // console.log(req.headers.authorization);
    const bearer = req.headers.authorization;

    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      // console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          // console.log(tokenEmail , queryEmail);
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              })
          }
          else {
            res.status(401).send('un-authorized access')
          }
        })
        .catch((error) => {
          res.status(401).send('un-authorized access')
        });
    }
    else {
      res.status(401).send('un-authorized access')
    }

  })
});

// // localhost 500 / a jawar jonno use kora hoyese,,
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
app.listen(port);