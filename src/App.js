import React, { useState, useRef } from "react";
import InsertForm from "./InsertForm";
import DBUtil from "./DBUtil";
import HeroStatus from "./HeroStatus";

import { downloadAsCSV, csvToObjectArray } from "./FileUtil";
import { properties } from "./properties";

import "./styles.css";

import EventViewer from "./EventViewer";

export default function App(props) {
  const [dbEvent, setDbEvent] = useState({ type: "GET" });
  const [eventList, setEventList] = useState([]);
  const [menu, setMenu] = useState(false);
  const hiddenFileInput = useRef(null);

  const executeEvent = (event) => {
    if (dbEvent.type !== event.type)
      setDbEvent({ type: event.type, data: event.data });
  };

  const dbEventCapture = (event) => {
    if (
      event.status === "DATA_ADDED" ||
      event.status === "DB_CLEARED" ||
      event.status === "RECORD_DELETED" ||
      event.status === "REPLACE_EXECUTED"
    ) {
      setDbEvent({ type: "REQUEST_COMPLETE" });
      setTimeout(loadData, 1000);
    }

    if (event.status === "RECORDS_RECEIVED") {
      setDbEvent({ type: "REQUEST_COMPLETE" });
      if (event.data && event.data.length !== eventList.length) {
        setEventList(event.data.reverse());
      }
    }
  };

  const loadData = () => {
    setDbEvent({ type: "GET" });
  };

  const exportData = () => {
    downloadAsCSV(eventList);
  };
  const clearAll = () => {
    if (window.confirm("Do you really want to clear everything?"))
      setDbEvent({ type: "CLEAR" });
  };
  const importData = () => {
    hiddenFileInput.current.click();
  };

  const hideShow = () => {
    setMenu(!menu);
  };

  const fileSelected = (evt) => {
    const selectedFile = evt.target.files[0];
    if (selectedFile) {
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function (theFile) {
        return function (e) {
          const convertedObjectArray = csvToObjectArray(e.target.result);
          //console.log("converted data is", csvToObjectArray(e.target.result));
          if (convertedObjectArray.length > 0) {
            if (
              window.confirm(
                "Are you sure want to import selected file?\nNote:All existing events will be erased!"
              )
            )
              setDbEvent({
                type: "REPLACE",
                data: convertedObjectArray.reverse()
              });
          } else {
            alert(
              "Invalid csv uploaded! Please make sure the exported file is not altered."
            );
          }
        };
      })(selectedFile);

      // read file
      reader.readAsText(selectedFile);
    }
  };

  window.document.title =
    properties.applicationName + " (" + properties.applicationMode + ")";

  return (
    <div className="App">
      <div className="appHeader">
        <div className="appTitle">{properties.applicationName} &nbsp;</div>
        <div className={menu ? "visible menuItems" : "hidden"}>
          <button
            title="Refresh"
            className="menuButton"
            style={{ marginLeft: "10px" }}
            onClick={loadData}
          >
            <i className="material-icons">cached</i>reload
          </button>
          <button
            title="Export"
            className="menuButton"
            style={{ marginLeft: "10px" }}
            onClick={exportData}
          >
            <i className="material-icons">file_download</i>export
          </button>
          <button
            title="Import"
            className="menuButton"
            style={{ marginLeft: "10px" }}
            onClick={importData}
          >
            <i className="material-icons">file_upload</i>import
          </button>
          <button
            title="Clear All"
            className="menuButton"
            style={{ marginLeft: "10px" }}
            onClick={clearAll}
          >
            <i className="material-icons">delete</i>erase
          </button>
          <input
            type="file"
            ref={hiddenFileInput}
            onChange={fileSelected}
            accept=".csv"
            style={{ display: "none" }}
          />
        </div>
        <button
          className="actionButton"
          title="Menu"
          style={{ marginLeft: "10px" }}
          onClick={hideShow}
        >
          <i className="small material-icons">
            {menu ? "chevron_left" : "chevron_right"}
          </i>
        </button>
      </div>
      <HeroStatus lastEvent={eventList[0]} />
      <InsertForm recordEvent={executeEvent} />
      <EventViewer events={eventList} deleteEvent={executeEvent} />
      <DBUtil request={dbEvent} response={dbEventCapture} />
    </div>
  );
}
