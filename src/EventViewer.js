import React, { useState } from "react";
import EventText from "./EventText";
import { eventList } from "./properties";

export default function EventViewer(props) {
  const { events } = props;
  const [menu, setMenu] = useState(false);
  const hideShow = () => {
    setMenu(!menu);
  };
  const deleteItem = (event) => {
    const deleteItem = events[parseInt(event.currentTarget.id, 10)];
    if (
      window.confirm(
        "Are you sure want to delete the event (" +
          eventList[deleteItem.event] +
          ") at " +
          deleteItem.time.toLocaleTimeString("en-US") +
          " ?"
      )
    )
      props.deleteEvent({ type: "DELETE", data: deleteItem });
    event.preventDefault();
  };
  let currentDate = "";

  const listItems = events.map((bevent, index) => {
    let newDate;
    if (currentDate !== bevent.time.toDateString()) {
      currentDate = bevent.time.toDateString();
      newDate = currentDate;
    }
    return (
      <React.Fragment>
        {newDate && (
          <tr
            id={index + "_h" + bevent.event}
            key={index + "_h" + bevent.event}
          >
            <td className="dateTd" colSpan="3">
              {newDate}
              <hr></hr>
            </td>
          </tr>
        )}
        <tr id={index + "_" + bevent.event} key={index + "_" + bevent.event}>
          <td>{bevent.time.toLocaleTimeString("en-US")}</td>
          <td>
            <EventText event={bevent.event} />
          </td>
          <td>
            <button
              className="actionButton"
              title="Clear All"
              style={{ marginLeft: "10px" }}
              onClick={deleteItem}
              id={index}
            >
              <i className="material-icons">remove_circle</i>
            </button>
          </td>
        </tr>
      </React.Fragment>
    );
  });
  return (
    <div className="eventViewer">
      <button className="actionButton" title="History Menu" onClick={hideShow}>
        {menu ? "Hide" : "Show"} History
        <i style={{ verticalAlign: "middle" }} className="small material-icons">
          {menu ? "expand_less" : "expand_more"}
        </i>
      </button>
      <div className={menu ? "visible" : "hidden"}>
        <table>
          <tbody>{listItems}</tbody>
        </table>
      </div>
    </div>
  );
}
