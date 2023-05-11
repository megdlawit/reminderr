"use strict";

function Events() {
  let events = []
  let nextId = 0;

  function reminderByDate(a, b) {
    return a.date.getTime() - b.date.getTime();
  }

  function add(time, note) {
    let event = Object.create(null);
    event.time = time;
    event.note = note;
    event.id = nextId++;
    events.push(event);
    events.sort((a, b) => { return a.time - b.time; });
  }

  function remove(id) {
    events = events.filter(event => event.id != id);
  }

  function all() {
    return events;
  }

  function clearMs(time) {
    return (time - (time % 1000));
  }

  function defaultData() {
    let stored = window.localStorage && window.localStorage.getItem("remindersData");
    let data = [];
    //??? remove old reminder data lookup
    if(stored) {
      const remindersData = JSON.parse(stored);
      console.log(`CONVERTED ${remindersData.length} OLD REMINDERS`);
      data = remindersData.map((value) => { return { time: new Date(value.date).getTime(), note: value.note }; });
    } else {
      const msPerDay = 1000 * 60 * 60 * 24;
      const today = clearMs(new Date().getTime() + 1000);
      const dayAgo = today - msPerDay;
      const thisWeek = today + (3 * msPerDay);
      const thisMonth = today + (14 * msPerDay);
      const later0 = today + (60 * msPerDay);
      const later1 = today + (90 * msPerDay);

      data.push({time: dayAgo, note: "This is already past"});
      data.push({time: today, note: "This is within the next day"});
      data.push({time: thisWeek, note: "This is within the next week"});
      data.push({time: thisMonth, note: "This is within the next month"});
      data.push({time: later0, note: "Press the plus button to add a reminder"});
      data.push({time: later1, note: "Long press a reminder to edit or remove it"});
    }
    return data;
  }

  function load() {
    let stored = window.localStorage && window.localStorage.getItem("eventsData");
    let data;
    if(stored) {
      data = JSON.parse(stored);
    } else {
      data = defaultData();
    }
    data.forEach(function(value) { return add(value.time, value.note) });
  }

  function save() {
    if(window.localStorage) {
      const data = JSON.stringify(events);
      window.localStorage.setItem("eventsData", data);
      console.log(`save (${events.length})`);
    }
  }

  return {
    add: add,
    remove: remove,
    all: all,
    load: load, 
    save: save
  };
}
