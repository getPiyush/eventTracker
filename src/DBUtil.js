import React, { useReducer } from "react";

const initialState = { status: "notInitated", db: null };

function reducer(state, action) {
  console.log("reducer called with ", action.type);
  switch (action.type) {
    case "success":
      return { status: "initiated", db: action.dbData };
    case "connecting":
      return { status: "initiating" };
    case "requesting":
      return { status: "requesting", db: state.db };
    case "received":
      return { status: "received", db: state.db };
    default:
      throw new Error();
  }
}

const getUniqueArray = (array) => {
  const dateArray = [];
  let uniqueArray = [];
  for (let index in array) {
    const dateObject = array[index].time;
    dateArray[
      dateObject.toLocaleTimeString("en-US") + "_" + dateObject.toDateString()
    ] = array[index];
  }
  for (let index in dateArray) {
    uniqueArray.push(dateArray[index]);
  }
  return uniqueArray;
};

export default function DBUtil(props) {
  const { request, response } = props;
  let locked = false;
  const [state, dispatch] = useReducer(reducer, initialState);

  const initiateDB = () => {
    let dbrequest = window.indexedDB.open("zrugal", 1);
    dispatch({ type: "connecting" });
    // onerror handler signifies that the database didn't open successfully
    dbrequest.onerror = function () {
      dispatch({ type: "error" });
    };
    // onsuccess handler signifies that the database opened successfully
    dbrequest.onsuccess = function () {
      console.log("Database opened successfully");

      dispatch({ type: "success", dbData: dbrequest.result });
    };

    // Setup the database tables if this has not already been done
    dbrequest.onupgradeneeded = function (e) {
      // Grab a reference to the opened database
      let db = e.target.result;

      // Create an objectStore to store our notes in (basically like a single table)
      // including a auto-incrementing key
      let objectStore = db.createObjectStore("bCycle_os", {
        autoIncrement: true
      });

      // Define what data items the objectStore will contain
      objectStore.createIndex("id", "id", { unique: true });
      objectStore.createIndex("event", "event", { unique: false });
      objectStore.createIndex("time", "time", { unique: true });

      dispatch({ type: "onupgradeneeded", dbData: db });
    };
  };

  const addItem = (event = "") => {
    console.log("calling addItem");
    if (event !== "") {
      let objectStore = state.db
        .transaction("bCycle_os", "readwrite")
        .objectStore("bCycle_os");
      const timeStamp = new Date();

      const eventData = {
        event: parseInt(event, 10),
        time: timeStamp,
        id: timeStamp.getTime()
      };
      // Make a request to add our newItem object to the object store
      let addRequest;
      if (!locked) addRequest = objectStore.add(eventData);
      locked = true;
      // request succeded
      addRequest.onsuccess = function () {
        // Clear the form, ready for adding the next entry
        response({ status: "DATA_ADDED" });
      };
    }
  };

  const getDataList = () => {
    // Open our object store and then get a cursor - which iterates through all the
    // different data items in the store\
    locked = true;
    let dataList = [];
    let objectStore = state.db
      .transaction("bCycle_os", "readonly")
      .objectStore("bCycle_os");
    objectStore.openCursor().onsuccess = function (e) {
      // Get a reference to the cursor
      let cursor = e.target.result;
      // If there is still another data item to iterate through, keep running this code
      if (cursor) {
        // console.log(cursor.value);
        dataList.push(cursor.value);
        cursor.continue();
      } else {
        response({
          status: "RECORDS_RECEIVED",
          data: getUniqueArray(dataList)
        });
      }
    };
  };

  const clearDB = () => {
    // open a read/write db transaction, ready for clearing the data
    let objectStore = state.db
      .transaction("bCycle_os", "readwrite")
      .objectStore("bCycle_os");

    let objectStoreRequest;
    if (!locked) objectStoreRequest = objectStore.clear();
    locked = true;
    objectStoreRequest.onsuccess = function (event) {
      response({ status: "DB_CLEARED" });
    };
  };

  const deleteItem = (item) => {
    console.log("deleting data with index " + item);

    let objectStore = state.db
      .transaction("bCycle_os", "readwrite")
      .objectStore("bCycle_os");

    objectStore.openCursor().onsuccess = function (e) {
      // Get a reference to the cursor
      let cursor = e.target.result;
      // If there is still another data item to iterate through, keep running this code
      if (cursor) {
        if (cursor.value.id === item.id) {
          console.log("deleting " + item.id);
          objectStore.delete(cursor.key);
        }
        cursor.continue();
      } else {
        response({ status: "RECORD_DELETED" });
      }
    };
  };

  const clearAndReplaceAll = (eventArrayData) => {
    let requestIndex = 0;

    let objectStore = state.db
      .transaction("bCycle_os", "readwrite")
      .objectStore("bCycle_os");

    let objectStoreClearRequest;
    // request db clear
    if (!locked) objectStoreClearRequest = objectStore.clear();
    locked = true;
    objectStoreClearRequest.onsuccess = function (event) {
      // db cleared
      locked = false;
      let addRequestArray = [];
      for (var index in eventArrayData) {
        // traverse through events
        const event = eventArrayData[index];
        //request add event
        if (!locked) addRequestArray[index] = objectStore.add(event);
        // request succeded
        addRequestArray[index].onsuccess = function () {
          //request add event succeded count success requests
          requestIndex++;
          console.log(
            "added index " + requestIndex + " = " + eventArrayData.length
          );
          if (requestIndex === eventArrayData.length)
            response({ status: "REPLACE_EXECUTED" });
        };
      }
      locked = true;
    };
  };

  const executeRequest = () => {
    console.log("Now executing request ", request.type);
    switch (request.type) {
      case "ADD":
        if (!locked) addItem(request.data);
        break;

      case "GET":
        if (!locked) getDataList();
        break;

      case "CLEAR":
        if (!locked) clearDB();
        break;

      case "DELETE":
        if (!locked) deleteItem(request.data);
        break;

      case "REPLACE":
        if (!locked) clearAndReplaceAll(request.data);
        break;

      case "REQUEST_COMPLETE":
        locked = false;
        break;

      default:
        break;
    }
  };

  if (state.status === "notInitated") {
    initiateDB();
  }

  return (
    <div className="statusText">
      {state.status !== "initiating" &&
      state.status !== "requesting" &&
      state.db
        ? executeRequest()
        : "[x]"}
      status: {state.status} {request.type}
    </div>
  );
}
