const express = require('express');
const colors = require('colors');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('.data/db.json');
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
  console.log(request.body);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  console.log('/notify-all'.green);
  response.sendStatus(200);
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/client/index.html');
});

const listener = app.listen(PORT, () => {
  console.log(`Vars: ${JSON.stringify(vapidDetails)}`);
  console.log(`Server on port ${listener.address().port}`.green);
});
