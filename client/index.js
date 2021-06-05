const VAPID_PUBLIC_KEY = 'BFdy44uz8c5Vc6pDP_XbMzwKTEz8biB-qQX5JiXOafohMMuLSwFpBDt2UbSpxrBHKDTgqcccytQR_HA_XrEETpE';


async function registerServiceWorker() {
  await navigator.serviceWorker.register('./service-worker.js');
  console.log("Here we are!");
}

async function unregisterServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration.unregister();
  console.log("Unregister");
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  postToServer('/add', subscription);
  console.log("Subscribed to post");
}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  postToServer('/remove-subscription', {
    endpoint: subscription.endpoint
  });
  await subscription.unsubscribe();
  console.log("UnSubscribed to post");
}

async function notifyMe() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  postToServer('/notify-me', { endpoint: subscription.endpoint });
  console.log("Notify-me");
}

async function notifyAll() {
  const response = await fetch('/notify-all', {
    method: 'POST'
  });
  if (response.status === 409) {
    document.getElementById('notification-status-message').textContent =
        'There are no subscribed endpoints to send messages to, yet.';
  }

    console.log("Notify-all");
}


async function connect() {

  await registerServiceWorker();
  await subscribeToPush();

  const registration = await navigator.serviceWorker.getRegistration();

  console.log(`Service worker registered. Scope: ${registration.scope}`);

  const subscription = await registration.pushManager.getSubscription();
  console.log(`Service worker subscribed to push. Endpoint: ${subscription.endpoint}`);

}


// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

async function postToServer(url, data) {
  url = 'http://localhost:3000/api/v1/notifications' + url;
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

window.onload = connect;
