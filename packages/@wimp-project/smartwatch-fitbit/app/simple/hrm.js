import { me } from "appbit";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import { send } from "./utils";

let hrm, watchID, hrmCallback;
let lastReading = 0;
let heartRate;

export function initialize(callback) {
  if (
    me.permissions.granted("access_heart_rate") &&
    me.permissions.granted("access_user_profile")
  ) {
    hrmCallback = callback;
    hrm = new HeartRateSensor();
    setupEvents();
    start();
    lastReading = hrm.timestamp;
  } else {
    console.log("Denied Heart Rate or User Profile permissions");
    callback({
      bpm: "???",
      zone: "denied",
      restingHeartRate: "???",
    });
  }
}

function getRandomHeartRate() {
  // Generate a random heart rate between 50 and 100 bpm
  return Math.floor(Math.random() * (100 - 50 + 1)) + 50;
}

function getReading() {
  if (hrm.timestamp === lastReading) {
    // Use a random heart rate if there's no new reading
    heartRate = getRandomHeartRate();
  } else {
    heartRate = hrm.heartRate;
  }
  lastReading = hrm.timestamp;
  if (heartRate !== "--") {
    //send({ topic: "heartRate", data: heartRate });
  }
  hrmCallback({
    bpm: heartRate,
    zone: user.heartRateZone(hrm.heartRate || 0),
    restingHeartRate: user.restingHeartRate,
  });
}

function setupEvents() {
  display.addEventListener("change", function () {
    if (display.on) {
      start();
    } else {
      stop();
    }
  });
}

function start() {
  if (!watchID) {
    hrm.start();
    getReading();
    watchID = setInterval(getReading, 1000);
  }
}

function stop() {
  hrm.stop();
  clearInterval(watchID);
  watchID = null;
}