"use strict";

function fixVerticalHeight() {
  function setVerticalHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  window.onresize = function() {
    setVerticalHeight();
  };
  setVerticalHeight();
}

function setVersion(version) {
  let versionSpan = document.getElementById("version");
  versionSpan.innerHTML = "version " + version.toFixed(2);
}

document.addEventListener("DOMContentLoaded", function() {
  const version = 0.96;
  fixVerticalHeight();
  setVersion(version);

  const updateButton = document.getElementById("update");
  addUpdateEvent(updateButton);

  const reminderWrap= document.getElementById("reminder-wrap");
  const reminderBox = document.getElementById("reminder-box");
  let plusButton = document.getElementById("plus");
  let editUi = getEditUi();
  let events = Events();
  events.load();

  addPlusEvent(plusButton, editUi);
  addTouchEvents(reminderWrap, reminderBox, editUi);
  addEditEvents(editUi, events, reminderWrap);
  updateReminders(events.all(), reminderWrap);
});
