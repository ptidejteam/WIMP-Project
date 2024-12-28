import * as messaging from "messaging";
import { settingsStorage } from "settings";

let firebaseTestURL = "https://wimp-system-default-rtdb.firebaseio.com";
/// ------------------------ You change you firabase url here ------------------------------------------////
let firebaseEndpoint = firebaseTestURL;
///  --------------------------------------------------------------------------------------------------////

export function initialize() {
  settingsStorage.addEventListener("change", (evt) => {
    if (evt.oldValue !== evt.newValue) {
      sendValue(evt.key, evt.newValue);
    }
  });
  messaging.peerSocket.addEventListener("message", (evt) => {
    const currentData = JSON.parse(evt.data);
    send(currentData.topic, currentData.data);
  });
}

function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val),
    });
  }
}

function sendSettingData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("No peerSocket connection");
  }
}

// function send(topic, data) {
//   let firebaseTestURL = `${firebaseEndpoint}/${topic}.json`;
//   fetch(firebaseTestURL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       deviceId:"fitbit_001", 
//       location: data, 
//       timestamp:Date.now()
//     }),
//   })
//     .then((response) => {
//       console.log("Response from server: " + response.status);
//       console.log("Response details : " + JSON.stringify(response));
//       return response.json();
//     })
//     .then((data) => {
//       console.log("Response from server: " + JSON.stringify(data));
//     })
//     .catch((error) => {
//       console.log("Error from server: " + error);
//     });
// }

function send(topic, data) {
  let firebaseTestURL = `${firebaseEndpoint}/${topic}/fitbit.json`; // Define a fixed path for the object you want to update
  
  // Structure the data object (You may adjust this based on your needs)
  const payload = {
    deviceId: "fitbit_001",
    location: data,
    timestamp: Date.now(),
  };

  fetch(firebaseTestURL, {
    method: "PUT",  // Use PUT to overwrite the existing data at this path
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),  // Send the structured data
  })
    .then((response) => {
      console.log("Response from server: " + response.status);
      console.log("Response details: " + JSON.stringify(response));
      return response.json();
    })
    .then((responseData) => {
      console.log("Updated data in Firebase: " + JSON.stringify(responseData));
    })
    .catch((error) => {
      console.log("Error from server: " + error);
    });
}

