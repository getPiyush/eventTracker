import { eventList, properties } from "./properties";

export const downloadAsCSV = (data) => {
  const csvStr = JSON2CSV(data);
  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvStr);
  hiddenElement.target = "_blank";
  hiddenElement.download =
    properties.applicationName +
    " Data of " +
    new Date().toDateString() +
    ".csv";
  hiddenElement.click();
};

const JSON2CSV = (objArray) => {
  let str = "";
  let line = ",Event,Time\n";
  for (var event in objArray) {
    line += event + ",";
    for (var index in objArray[event]) {
      if (index === "time") {
        line +=
          objArray[event][index].toDateString() +
          " " +
          objArray[event][index].toLocaleTimeString("en-US") +
          ",";
      } else if (index === "event") {
        line += eventList[objArray[event][index]] + ",";
      }
    }
    line += "\n";
  }
  str = str + line;
  return str;
};

export const csvToObjectArray = (csvText) => {
  return CSV2JSON(csvText);
};

const eventToCode = (event) => {
  const code = eventList.indexOf(event);
  return code > 0 ? code : 0;
};
const CSV2JSON = (csvText) => {
  let objectArray = [];
  const lines = csvText.split("\n");
  if (lines.length > 0) {
    for (var line in lines) {
      const columns = lines[line].split(",");
      const dateTime = new Date(columns[2]);
      if (columns[0] !== "" && dateTime) {
        let eventObject = {};
        eventObject.event = eventToCode(columns[1]);
        eventObject.time = dateTime;
        eventObject.id = dateTime.getTime();
        objectArray.push(eventObject);
      }
    }
  }
  return objectArray;
};
