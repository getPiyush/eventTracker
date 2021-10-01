import { eventList } from "./properties";

export default function EventText(props) {
  return <span className="eventText">{eventList[props.event]}</span>;
}
