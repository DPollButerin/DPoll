import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import PropTypes from "prop-types";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useDisclosure,
} from "@chakra-ui/react";

import { Box, useToast, Show } from "@chakra-ui/react";
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
  // const [duration, setDuration] = useState(null);

  // const { isOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen: true });
  const toast = useToast();
  const doToast = (title, description, status) => {
    console.log("TX TOAST DECLENCHE");
    toast({
      title: title,
      description: description,
      status: status,
      duration: 9000,
      isClosable: true,
    });
  };
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
          type = "error";
          data = error;
        } else {
          type = "success";
          data = event.returnValues;
          // setDuration(5000);

          props.forwardEventResult(data);
        }
      }
      setShow({
        status: true,
        type: type,
        data: data,
      });

      console.log(
        "EVENTMANAGER/ handleEventResult DATA A AFFICHER DS EVENTS!!!!!!",
        show
      );
      getContent();
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

      props.data.instance.events[props.data.name](handleEventResult);
      console.log(
        `EVENTMANAGER/ ${props.data.name}`,
        props.data.instance.events[props.data.name]
      );

      // switch (props.data.name) {
      //   case "VoterRegistered":
      //     props.data.instance.events.VoterRegistered(handleEventResult);
      //     console.log(
      //       "EVENTMANAGER/ VoterRegistered",
      //       props.data.instance.events.VoterRegistered
      //     );
      //     break;
      //   case "WorkflowStatusChange":
      //     props.data.instance.events.WorkflowStatusChange(handleEventResult);
      //     console.log(
      //       "EVENTMANAGER/ WorkflowStatusChange",
      //       props.data.instance.events.WorkflowStatusChange
      //     );
      //     break;
      //   case "ProposalRegistered":
      //     props.data.instance.events.ProposalRegistered(handleEventResult);
      //     console.log(
      //       "EVENTMANAGER/ ProposalRegistered",
      //       props.data.instance.events.ProposalRegistered
      //     );
      //     break;
      //   case "Voted":
      //     props.data.instance.events.Voted(handleEventResult);
      //     console.log("EVENTMANAGER/ Voted", props.data.instance.events.Voted);
      //     break;
      //   default:
      //     break;
      // }

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
  const getContent = useCallback(() => {
    let content = "";

    if (show.type === "success") {
      let details;
      // switch (props.data.name) {
      //   case "VoterRegistered":
      //     details = `Address : ${show.data.voterAddress}`;
      //     break;
      //   case "WorkflowStatusChange":
      //     details = `Previous status : ${show.data.previousStatus} - New status : ${show.data.newStatus}`;
      //     break;
      //   case "ProposalRegistered":
      //     details = `ID of registered proposal : ${show.data.proposalId}`;
      //     break;
      //   case "Voted":
      //     details = `Voter : ${show.data.voter} - vote for ID : ${show.data.proposalId}`;
      //     break;
      //   default:
      //     break;
      // }
      let temp = () => {
        show.data.map((item, index) => {
          return (
            <p>
              {" "}
              -arg{index} : <b> {item} </b>
            </p>
          );
          //`-arg${index} : ${item}\n`;
        });
      };
      content = (
        <>
          <p>
            <b>{`Event ${props.data.name} !`}</b> <i>Its information :</i>
          </p>
          <hr />

          {temp}
        </>
      );
    } else if (show.type === "error") {
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
    // return content;
    doToast("Event received :", content, show.type);
  });

  useLayoutEffect(() => {
    if (data !== props.data) {
      initSubscription();
    }
  }, [props.data, data, initSubscription]);

  // useEffect(() => {
  //   if (show.status) {
  //     getContent();
  //   }
  // }, [show.status, getContent]);
  // useLayoutEffect(() => {
  //   let timer;
  //   if (show.status) {
  //     timer = setTimeout(() => {
  //       handleOnClose();
  //     }, duration);
  //   }
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [show.status, handleOnClose, duration]);

  return (
    <>
      {/* <Box>BIDOUILLAGE A RATTRAPER</Box> */}
      {show.status ? (
        <>
          <Show below="sm">
            <Box>SCREEN TO SMALL</Box>
            {/* {getContent} */}
          </Show>
        </>
      ) : null}
    </>
    // <>
    //   {show.status && show.type === "success" ? (
    //     // <Alert
    //     //   variant={show.type}
    //     //   onClose={handleOnClose}
    //     //   dismissible
    //     //   style={{ fontSize: "0.8em" }}
    //     // >
    //     //   {getContent()}
    //     // </Alert>

    //     <Alert status="success" style={{ fontSize: "0.8em" }}>
    //       <AlertIcon />

    //       <AlertDescription>{getContent()}</AlertDescription>

    //       <CloseButton
    //         alignSelf="flex-start"
    //         position="relative"
    //         right={-1}
    //         top={-1}
    //         onClick={onClose}
    //       />
    //     </Alert>
    //   ) : null}
    // </>
  );
}

EventManager.propTypes = {
  data: PropTypes.object,
  close: PropTypes.func,
};
