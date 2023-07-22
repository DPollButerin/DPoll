import React, { useState, useLayoutEffect, useCallback } from "react";
import PropTypes from "prop-types";

import Alert from "react-bootstrap/Alert";

/**
 * Manages events binded to a transaction
 *
 * - display alert information
 * - 2 states : succes /error
 *
 * @param {any} props
 * @todo : REFACTOR : close the alert is messy => manager and context => not good
 */
export default function EventManager(props) {
  const [data, setData] = useState();
  const [show, setShow] = useState({
    status: false,
    type: "",
    data: "",
  });
  const [duration, setDuration] = useState(null);

  /**
   * handles result of the event
   *
   * - as they're no unsubcription, handles it by testing  type === ""
   * - if the event result is needed callback exists
   */
  const handleEventResult = useCallback(
    function (error, event) {
      let type = show.type;
      let data = show.data;

      if (show.type === "") {
        if (error) {
          type = "danger";
          data = error;
        } else {
          type = "success";
          data = event.returnValues;
          setDuration(5000);

          props.forwardEventResult(data);
        }
      }
      setShow({
        status: true,
        type: type,
        data: data,
      });
    },
    [show.type, show.data, props]
  );

  const handleOnClose = useCallback(() => {
    setShow({
      status: false,
      type: "",
      data: null,
    });
  }, []);

  /**
   * initializes a new event listener
   *
   * @todo try subscriptionID to unsubscribe, at the moment it doesn't work :
   * .on('connected', function(id){subscriptionId = id;});
   * then subscriptionId.unsubscribe();
   */
  const initSubscription = useCallback(
    async function () {
      setData(props.data);

      switch (props.data.name) {
        case "VoterRegistered":
          props.data.instance.events.VoterRegistered(handleEventResult);
          console.log(
            "EVENTMANAGER/ VoterRegistered",
            props.data.instance.events.VoterRegistered
          );
          break;
        case "WorkflowStatusChange":
          props.data.instance.events.WorkflowStatusChange(handleEventResult);
          console.log(
            "EVENTMANAGER/ WorkflowStatusChange",
            props.data.instance.events.WorkflowStatusChange
          );
          break;
        case "ProposalRegistered":
          props.data.instance.events.ProposalRegistered(handleEventResult);
          console.log(
            "EVENTMANAGER/ ProposalRegistered",
            props.data.instance.events.ProposalRegistered
          );
          break;
        case "Voted":
          props.data.instance.events.Voted(handleEventResult);
          console.log("EVENTMANAGER/ Voted", props.data.instance.events.Voted);
          break;
        default:
          break;
      }

      setShow({
        status: true,
        type: "",
        msg: "event initalized",
      });
    },
    [props.data, handleEventResult]
  );

  /**
   * get the content to display following the result of the event
   *
   * - error disabled cause already processed by txmanager (without info)
   */
  const getContent = () => {
    let content = "";

    if (show.type === "success") {
      let details;
      switch (props.data.name) {
        case "VoterRegistered":
          details = `Address : ${show.data.voterAddress}`;
          break;
        case "WorkflowStatusChange":
          details = `Previous status : ${show.data.previousStatus} - New status : ${show.data.newStatus}`;
          break;
        case "ProposalRegistered":
          details = `ID of registered proposal : ${show.data.proposalId}`;
          break;
        case "Voted":
          details = `Voter : ${show.data.voter} - vote for ID : ${show.data.proposalId}`;
          break;
        default:
          break;
      }
      content = (
        <>
          <p>
            <b>{`Event ${props.data.name} !`}</b> <i>Its information :</i>
          </p>
          <hr />

          <p>
            {" "}
            <b> {details} </b>
          </p>
        </>
      );
    } else if (show.type === "danger") {
      content = (
        <>
          <p>
            <b> {`${show.name} - Transaction failed, an error occured`}</b>
            {` - code : ${show.data.code}`}
          </p>
          <hr />
          <p>{`message : ${show.data.message}`}</p>
        </>
      );
    }
    return content;
  };

  useLayoutEffect(() => {
    if (data !== props.data) {
      initSubscription();
    }
  }, [props.data, data, initSubscription]);

  useLayoutEffect(() => {
    let timer;
    if (show.status) {
      timer = setTimeout(() => {
        handleOnClose();
      }, duration);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [show.status, handleOnClose, duration]);

  return (
    <>
      {show.status && show.type === "success" ? (
        <Alert
          variant={show.type}
          onClose={handleOnClose}
          dismissible
          style={{ fontSize: "0.8em" }}
        >
          {getContent()}
        </Alert>
      ) : null}
    </>
  );
}

EventManager.propTypes = {
  data: PropTypes.object,
  close: PropTypes.func,
};
