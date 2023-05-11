function addUpdateEvent(updateButton) {
  updateButton.onclick = function() {
    const cacheName = "reminder-cache";
    if(navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage("update-cache");
      } else {
        console.log("could not send message: no service worker");
      }
  };
}

function addPlusEvent(button, ui) {
  button.onclick = function() {
    const msPerDay= 1000 * 60 * 60 * 24;
    let time = new Date().getTime() + (7 * msPerDay);
    time -= (time % msPerDay);
    ui.i = -1;
    ui = writeEditUi(ui, time, "");
    ui.remove.style.display = "none";
    ui.box.style.display = "block";
  };
}

function addEditEvents(ui, events, wrap) {
  ui.save.onclick = function() {
    ui.box.style.display = "none";
    if(ui.id >= 0) {
      events.remove(ui.id);
    }
    events.add(...readEditUi(ui));
    updateReminders(events.all(), wrap);
    events.save();
  };

  ui.remove.onclick = function() {
    ui.box.style.display = "none";
    if(ui.id >= 0) {
      events.remove(ui.id);
    }
    updateReminders(events.all(), wrap);
    events.save();
  };

  ui.cancel.onclick = function() {
    ui.box.style.display = "none";
  };
}

function addTouchEvents(wrap, box, ui) {
  let scrollEnabled = false;
  let scrollY = 0;
  let yOffset = 0;
  const longPressMs = 750;
  const longPressMoveMax = 10;
  let longPressTimer;
  let longPressTarget = null;
  let longPressY = 0;

  function enableScroll(enabled, y = 0) {
    scrollEnabled = enabled;
    scrollY = y;
  }

  function moveScroll(y) {
    if(scrollEnabled) {
      yOffset += (y - scrollY);
      scrollY = y;
      const yOffsetMin = box.clientHeight - box.scrollHeight;
      if((yOffsetMin > 0) || (yOffset > 0)) {
        yOffset = 0;
      } else if (yOffset < yOffsetMin) {
        yOffset = yOffsetMin;
      }
      wrap.style.top = yOffset + "px";
    }
  }

  function enableLongPress(target, y) {
    longPressTarget = target && target.closest(".reminder");
    longPressY = y;
    if(longPressTarget) {
      longPressTimer = setTimeout(editReminder.bind(longPressTarget), longPressMs);
    }
  }

  function disableLongPress() {
    if(longPressTimer) {
      clearTimeout(longPressTimer);
    }
  }

  function moveLongPress(y) {
    if(Math.abs(y - longPressY) > longPressMoveMax) {
      disableLongPress();
    }
  }

  function editReminder() {
    let id = parseInt(this.getAttribute("data_id"));
    let time = parseInt(this.getAttribute("data_time"));
    let note = this.querySelector(".note").textContent;
    ui.id = id;
    ui = writeEditUi(ui, time, note);
    ui.remove.style.display = "block";
    ui.box.style.display = "block";
  }

  wrap.ontouchstart = function(event) {
    event.preventDefault();
    const eventY = event.touches[0] && event.touches[0].clientY;
    enableScroll(true, eventY);
    enableLongPress(event.target, eventY);
  };

  wrap.ontouchmove = function(event) {
    event.preventDefault();
    const eventY = event.touches[0] && event.touches[0].clientY;
    moveScroll(eventY);
    moveLongPress(eventY);
  };

  wrap.ontouchend = function(event) {
    event.preventDefault();
    enableScroll(false);
    disableLongPress();
  };

  wrap.onmousedown = function(event) {
    event.preventDefault();
    enableScroll(true, event.clientY);
  };

  wrap.onmouseup = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  wrap.onmouseleave = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  wrap.onmousemove = function(event) {
    event.preventDefault();
    moveScroll(event.clientY);
  };

  wrap.ondblclick = function(event) {
    event.preventDefault();
    let reminder = event.target && event.target.closest(".reminder");
    (editReminder.bind(reminder))();
  }
}

function untilClass(from, to) {
  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  let diff = (to - from);
  if(diff > oneMonth) {
    return "until-future";
  } else if(diff > oneWeek) {
    return "until-month";
  } else if(diff > oneDay) {
    return "until-week";
  } else if(diff > 0) {
    return "until-day";
  } else {
    return "until-past";
  }
}

function untilText(from , to) {
  let rows = [];
  if(to - from > 0) {
    let dyear = to.getFullYear() - from.getFullYear();
    let dmonth = to.getMonth() - from.getMonth();
    if(dmonth < 0) {
      dyear -= 1;
      dmonth += 12
    }
    let dday = to.getDate() - from.getDate();
    if(dday < 0) {
      dmonth -= 1;
      dday += new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
    }
    let dweek = parseInt(dday / 7);
    dday = dday % 7;

    if(dyear > 0) {
      rows.push(dyear + " year" + (dyear > 1 ? "s" : ""));
    }
    if(dmonth > 0) {
      rows.push(dmonth + " mo" + (dmonth > 1 ? "s." : "."));
    }
    if(dweek > 0) {
      rows.push(dweek + " week" + (dweek > 1 ? "s" : ""));
    }
    if(dday > 0) {
      rows.push(dday + " day" + (dday > 1 ? "s" : ""));
    } else if(rows.length == 0) {
      rows.push("today");
    }
  } else {
    rows.push("past");
  }

  const rowCount = 2;
  while(rows.length < rowCount) {
    rows.push("");
  }
  return `<span>${rows[0]}</span><span>${rows[1]}</span>`;
}

function createReminder(event) {
  const now = new Date();
  const options0 = {weekday:"short", day:"numeric", month:"short", year:"numeric"};
  const date = new Date(event.time);

  const options1 = {hour:"numeric", minute:"2-digit"};
  var ui = document.createElement("div");
  ui.classList.add("reminder");
  ui.classList.add(untilClass(now, date));
  ui.setAttribute("data_id", event.id);
  ui.setAttribute("data_time", event.time);
  var untilElem = document.createElement("div");
  untilElem.setAttribute("class", "until");
  untilElem.innerHTML = untilText(now, date);
  var dateElem = document.createElement("div");
  dateElem.setAttribute("class", "date");
  let dateSpan0 = document.createElement("span");
  dateSpan0.innerHTML = date.toLocaleString("en-us", options0);
  let dateSpan1 = document.createElement("span");
  dateSpan1.innerHTML = date.toLocaleString("en-us", options1);
  dateElem.innerHTML = dateSpan0.outerHTML + dateSpan1.outerHTML;
  var noteElem = document.createElement("div");
  noteElem.setAttribute("class", "note");
  noteElem.innerHTML = event.note;

  ui.appendChild(untilElem);
  ui.appendChild(dateElem);
  ui.appendChild(noteElem);
  return ui;
}

function updateReminders(events, wrap) {
  while(wrap.firstChild) {
    wrap.removeChild(wrap.firstChild);
  }
  events.forEach((event) => {
    wrap.appendChild(createReminder(event));
  });
}
