const express = require('express');
const colors = require('colors');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('.data/db.json');
require('dotenv').config();
const db = low(adapter);
const PORT = 4000;
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
};

db.defaults({
  subscriptions: []
}).write();

function sendNotifications(subscriptions) {
  console.log('sending notification: '.green);
  // Create the notification content.
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`
    }
  });
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails
  };
// Send a push message to each client specified in the subscriptions array.
subscriptions.forEach(subscription => {
  const endpoint = subscription.endpoint;
  const id = endpoint.substr((endpoint.length - 8), endpoint.length);
  webpush.sendNotification(subscription, notification, options)
    .then(result => {
      console.log(`Endpoint ID: ${id}`);
      console.log(`Notification: ${notification}`);
      console.log(`Result: ${result.statusCode}`);
    })
    .catch(error => {
      console.log(`Endpoint ID: ${id}`);
      console.log(`Error: ${error} `);
    });
});
}

const app = express();
app.use(bodyparser.json());
app.use(express.static('client'));

app.post('/add-subscription', (request, response) => {
  console.log('/add-subscription'.green);
  console.log('Request: ', request.body);
  console.log(`Subscribing ${request.body.endpoint}`);
  db.get('subscriptions')
    .push(request.body)
    .write();
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  console.log('/remove-subscription'.yellow);
  console.log('Request: ', request.body);
  console.log(`Unsubscribing ${request.body.endpoint}`);
  db.get('subscriptions')
    .remove({endpoint: request.body.endpoint})
    .write();
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  console.log('/notify-me'.green);
  console.log('Request: ', request.body);
  console.log(`Notifying ${request.body.endpoint}`);
  const subscription =
      db.get('subscriptions').find({endpoint: request.body.endpoint}).value();
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  console.log('/notify-all'.green);
  console.log('Request: ', request.body);
  console.log('Notifying all subscribers');
  const subscriptions =
      db.get('subscriptions').cloneDeep().value();
  if (subscriptions.length > 0) {
    sendNotifications(subscriptions);
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/client/index.html');
});

const listener = app.listen(PORT, () => {
  console.log(`Vars: process: ${process.env.VAPID_SUBJECT}`);
  console.log(`Vars: ${JSON.stringify(vapidDetails)}`);
  console.log(`Server on port ${listener.address().port}`.green);
});
