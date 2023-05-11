function getEditUi() {
  return {
    box: document.getElementById("edit-box"),
    save: document.getElementById("edit-save"),
    remove: document.getElementById("edit-remove"),
    cancel: document.getElementById("edit-cancel"),
    year: document.getElementById("year"),
    month: document.getElementById("month"),
    day: document.getElementById("day"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    am: document.getElementById("am"),
    pm: document.getElementById("pm"),
    duration: document.getElementById("duration"),
    note: document.getElementById("note"),
    id: -1
  };
}

function readEditUi(ui) {
  let date = new Date();
  date.setFullYear(parseInt(ui.year.value));
  date.setMonth(parseInt(ui.month.value - 1));
  date.setDate(parseInt(ui.day.value));
  const hasTime = !!ui.hours.value;
  const isPm = ui.pm.checked;
  date.setHours(hasTime ? ((parseInt(ui.hours.value) % 12) + (isPm ? 12 : 0)) : 0);
  date.setMinutes((hasTime && ui.minutes.value) ? parseInt(ui.minutes.value) : 0);
  date.setSeconds(hasTime ? 1 : 0);
  date.setMilliseconds((hasTime && ui.duration.value) ? parseInt(ui.duration.value) : 0);
  return [date.getTime(), ui.note.value];
}

function writeEditUi(ui, time, note) {
  const date = new Date(time);
  const useTime = (date.getSeconds() > 0);
  const useDuration = (date.getMilliseconds() > 0);
  const hours = date.getHours() % 12 || 12;
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const isPm = date.getHours() > 11;
  ui.year.value = date.getFullYear();
  ui.month.value = date.getMonth() + 1;
  ui.day.value = date.getDate();
  ui.hours.value = (useTime ? hours : "");
  ui.minutes.value = (useTime ? minutes : "");
  ui.am.checked = useTime && !isPm;
  ui.pm.checked = useTime && isPm;
  ui.duration.value = (useDuration && useTime ? date.getMilliseconds() : "");
  ui.note.value = note;
  return ui;
}

