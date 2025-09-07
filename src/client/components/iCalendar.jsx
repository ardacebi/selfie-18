const fullDate = (n) => (n < 10 ? "0" + n : n);

const frequencyMap = (type) => {
  switch (type) {
    case "weekly":
      return "WEEKLY";
    case "monthly":
      return "MONTHLY";
    case "yearly":
      return "YEARLY";
    default:
      return "DAILY";
  }
};

const frequencyWeekDaysMap = (days) => {
  return days
    .map((day) => {
      switch (day) {
        case 0:
          return "SU";
        case 1:
          return "MO";
        case 2:
          return "TU";
        case 3:
          return "WE";
        case 4:
          return "TH";
        case 5:
          return "FR";
        case 6:
          return "SA";
        default:
          return "";
      }
    })
    .join(",");
};

export const formatDateToICalendar = (date) => {
  return (
    date.getUTCFullYear() +
    fullDate(date.getUTCMonth() + 1) +
    fullDate(date.getUTCDate()) +
    "T" +
    fullDate(date.getUTCHours()) +
    fullDate(date.getUTCMinutes()) +
    fullDate(date.getUTCSeconds()) +
    "Z"
  );
};

export const iCalendarGenerator = (eventData, currentDate) => {
  const uid = `${eventData._id}@selfie.com`;
  const dtstamp = formatDateToICalendar(currentDate);
  const dtstart = formatDateToICalendar(new Date(eventData.date));
  const dtend = eventData.eventEnd
    ? formatDateToICalendar(new Date(eventData.eventEnd))
    : dtstart;

  if (eventData.type === "basic") {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Alessandro D'Ambrosio e Arda Cebi//Selfie//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${eventData.title}`,
      `DESCRIPTION:${eventData.description || ""}`,
      `LOCATION:${eventData.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.join("\r\n");
  } else {
    const rrule =
      `FREQ=${frequencyMap(eventData.frequencyType)};INTERVAL=1;` +
      (eventData.frequencyType === "yearly"
        ? `BYMONTH=${fullDate(new Date(eventData.date).getUTCMonth() + 1)};`
        : "") +
      (eventData.frequencyType === "monthly" ||
      eventData.frequencyType === "yearly"
        ? `BYMONTHDAY=${fullDate(new Date(eventData.date).getUTCDate())};`
        : "") +
      (eventData.frequencyType === "weekly"
        ? `BYDAY=${frequencyWeekDaysMap(eventData.frequencyWeekDays)};`
        : "") +
      (eventData.repetition > 1 ? `COUNT=${eventData.repetition};` : "");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Alessandro D'Ambrosio e Arda Cebi//Selfie//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `RRULE:${rrule}`,
      `SUMMARY:${eventData.title}`,
      `DESCRIPTION:${eventData.description || ""}`,
      `LOCATION:${eventData.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.join("\r\n");
  }
};

export const downloadICalendarFile = (iCalendarContent, fileName) => {
  /*
                                  APPUNTO PERSONALE!
                                       
    Un Blob (Binary Large OBject) è un oggetto JavaScript che rappresenta dati binari grezzi. 
    In sostanza, agisce come un contenitore per dati (ad esempio, testi, immagini o altri file) 
    e viene spesso utilizzato per operazioni come il download o l'upload di file.
  */

  const blob = new Blob([iCalendarContent], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
