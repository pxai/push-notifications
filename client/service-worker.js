self.addEventListener('push', (event) => {
  let notification = event.data.json();
  console.log("Are we here or not??? ", JSON.stringify(event.data));
  self.registration.showNotification(
    notification.title,
    notification.options
  );
});
