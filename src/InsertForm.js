import React, { useState } from "react";
import { eventList } from "./properties";

export default function InsertForm(props) {
  const [selectedEvent, setSelectedEvent] = useState(0);

  const handleChange = (event) => {
    console.log({ value: selectedEvent });
    setSelectedEvent(event.target.value);
  };

  const handleSubmit = (event) => {
    props.recordEvent({ type: "ADD", data: selectedEvent });
    event.preventDefault();
  };

  const options = eventList.map((event, index) => (
    <option key={index + "_" + event} value={index}>
      {event}
    </option>
  ));

  return (
    <div className="insertForm">
      <span>My Baby</span>
      <div style={{ marginLeft: "10px" }}>
        <select value={selectedEvent} onChange={handleChange}>
          {options}
        </select>
      </div>
      <div>
        <button
          title="Add"
          style={{ marginLeft: "10px" }}
          onClick={handleSubmit}
        >
          <i className="material-icons">add</i>
        </button>
      </div>
    </div>
  );
}
