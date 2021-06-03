self.addEventListener('push', (event) => {
  let notification = event.data.json();
  console.log("Are we here or not??? ay", JSON.stringify(event));
  self.registration.showNotification(
    notification.title,
    notification.options
  );
});
