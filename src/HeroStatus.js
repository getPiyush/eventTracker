import EventText from "./EventText";

export default function HeroStatus(props) {
  const { lastEvent } = props;
  let herotext = "";

  if (lastEvent !== undefined) {
    return (
      <div className="heroStatus">
        <center>
          <h1>
            <EventText event={lastEvent.event} />
            &nbsp;&nbsp;<i>!</i>
          </h1>
          <span>
            {lastEvent.time.toLocaleTimeString("en-US")} <br></br>
            {lastEvent.time.toDateString()}
          </span>
        </center>
      </div>
    );
  }
  return <h3>{herotext}</h3>;
}
