import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";

import PropTypes from "prop-types";

// import {
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   AlertDescription,
//   CloseButton,
//   useDisclosure,
// } from "@chakra-ui/react";

import { useToast, Box, Show, Hide } from "@chakra-ui/react";
// import { createStandaloneToast } from "@chakra-ui/react";
// @todo : choose between alert and toast

/**
 * @dev  Manages one transaction
 *
 * - display alert with 3 states : initialised / processed / failed
 * - triggered by initTx from TxContext
 *
 * @param {object} data
 * @param {function} closeTx
 * @param {function} setAlertInvalidTx
 *
 * @todo : change the way the tx is initialized
 * uncomment React.StrictMode => error with txmanager rerendering initTx
 * @todo : instead of show status, directly remove the tx from the TxContext array
 * @todo : MANAGE send and call !!!!!!!! to be really utile
 */
export default function TxManager({ data, closeTx, setAlertInvalidTx }) {
  /* the tx has/not been sent, corresponding function, tx description */
  const [status, setStatus] = useState({
    sent: false,
    show: false,
    type: "",
    msg: "",
  });
  // const [duration, setDuration] = useState(null);
  // const { updateContractInfos } = useContracts();
  // const [isVisible, setIsVisible] = useState(false);

  // const {
  //   isOpen: isVisble,
  //   onClose,
  //   onOpen,
  // } = useDisclosure({ defaultIsOpen: true });

  const { contractsState } = useContracts();

  const toast = useToast(); //useToast();
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

  // const isNeedingUpdate = (funcName) => {
  //   let needUpdate = false;
  //   switch (funcName) {
  //     case "AddVoter":
  //       needUpdate = true;
  //       break;
  //     case "startProposalsRegistering":
  //       needUpdate = true;
  //       break;
  //     case "endProposalsRegistering":
  //       needUpdate = true;
  //       break;
  //     case "startVotingSession":
  //       needUpdate = true;
  //       break;
  //     case "endVotingSession":
  //       needUpdate = true;
  //       break;

  //     default:
  //       break;
  //   }
  //   return needUpdate;
  // };
  /**
   * initializes a tx following the desired function call
   * @dev : be sure to set the correct function name and event // WRITE functions
   * @todo : change the way the tx is initialized
   * @todo : externalize send func.. to have a generic tx manager
   */
  const initTransaction = useCallback(
    async function () {
      // const { contractInstance, functionName, params, fromAccount } = data;
      const { contractInstance, functionName, params, fromAccount, value } =
        data;

      const show = true;
      const type = "success";
      // let msg;
      console.log(
        "initTransaction/ data",
        contractInstance,
        functionName,
        params,
        fromAccount,
        value
      );
      let msg = `Transaction initialized : ${functionName}\nparams: ${params}`;
      // try {
      //   if (params.lenght > 0) {
      contractInstance.methods[functionName](...params)
        .send({ from: fromAccount, value: value }, handleTx)
        .on("error", function (e) {
          console.log("initTransaction/ error", e);
          setAlertInvalidTx(`Invalid Tx: ${functionName} rejected`);
          setStatus({
            sent: true,
            show: show,
            type: type,
            msg: msg,
          });
          //           // setIsVisible(true);
          doToast("FROM TX ERROR/ Transaction rejected", msg, "error");
        });
      //   } else {
      //     contractInstance.methods[functionName]()
      //       .send({ from: fromAccount, value: value }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx(`Invalid Tx: ${functionName} rejected`);
      //       });
      //   }

      //ICICICICI
      // } catch (e) {
      //   console.log("initTransaction/ error", e);
      //   setAlertInvalidTx(`Invalid Tx: ${functionName} rejected`);
      //    setStatus({
      //             sent: true,
      //             show: show,
      //             type: type,
      //             msg: msg,
      //           });
      // //           // setIsVisible(true);
      //           doToast("FROM TRYCATCH/ Transaction rejected", msg, "error");
      // }
      //ICICICICI

      // try {
      //   switch (functionName) {
      //     case "addMember":
      //       msg = "Transaction initialized : adding voter";

      //       const checkSumAddress =
      //         contractsState.web3.utils.toChecksumAddress(fromAccount);
      //       contractInstance.methods
      //         .addMember(...params)
      //         .send(
      //           {
      //             from: checkSumAddress,
      //             value: value,
      //           },
      //           handleTx
      //         )
      //         .on("error", function (e) {
      //           console.log("initTransaction/ error", e);
      //           setAlertInvalidTx("Invalid Tx: adding voter rejected");

      //           // setDuration(3000)
      //           setStatus({
      //             sent: true,
      //             show: show,
      //             type: type,
      //             msg: msg,
      //           });
      //           // setIsVisible(true);
      //           doToast("Transaction rejected", msg, "error");
      //         });
      // setDuration(3000);
      // setStatus({
      //   sent: true,
      //   show: show,
      //   type: type,
      //   msg: msg,
      // });
      // // setIsVisible(true);
      // doToast("Transaction initialized", msg, "info");
      //       break;
      //     default:
      //       break;
      //   }
      // } catch (e) {
      //   console.log("initTransaction/ error", e);
      //   setAlertInvalidTx(`Invalid Tx: ${functionName} rejected`);
      // }
      //   case "startProposalsRegistering":
      //     msg = "Transaction initialized : starting proposal registering";
      //     contractInstance.methods
      //       .startProposalsRegistering()
      //       .send({ from: fromAccount }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx(
      //           "Invalid Tx: starting proposal registering rejected"
      //         );
      //       });
      //     break;
      //   case "endProposalsRegistering":
      //     msg = "Transaction initialized : ending proposal registering";
      //     contractInstance.methods
      //       .endProposalsRegistering()
      //       .send({ from: fromAccount }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx(
      //           "Invalid Tx: ending proposal registering rejected"
      //         );
      //       });
      //     break;
      //   case "startVotingSession":
      //     msg = "Transaction initialized : starting voting session";
      //     contractInstance.methods
      //       .startVotingSession()
      //       .send({ from: fromAccount }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx("Invalid Tx: starting voting session rejected");
      //       });
      //     break;
      //   case "endVotingSession":
      //     msg = "Transaction initialized : ending voting session";
      //     contractInstance.methods
      //       .endVotingSession()
      //       .send({ from: fromAccount }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx("Invalid Tx: ending voting session rejected");
      //       });
      //     break;
      //   case "addProposal":
      //     msg = "Transaction initialized : adding proposal";
      //     contractInstance.methods
      //       .addProposal(params)
      //       .send({ from: fromAccount }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx("Invalid Tx: adding proposal rejected");
      //       });
      //     break;
      //   case "setVote":
      //     msg = "Transaction initialized : voting";
      //     contractInstance.methods
      //       .setVote(params)
      //       .send({ from: fromAccount }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx("Invalid Tx: voting rejected");
      //       });
      //     break;

      //   default:
      //     break;
      // }
      // setDuration(3000);
      setStatus({
        sent: true,
        show: show,
        type: type,
        msg: msg,
      });
      // setIsVisible(true);
      // doToast("Transaction initialized", msg, "info");
    }
    //[] //[data, setAlertInvalidTx]
  );

  /**
   * @dev handles result of the tx
   * @param {any} error
   * @param {string} txHash
   *
   * @todo changes the error checking / -32000 is for contract rejection
   * -32603 from metamask (account in metamsk is not the one connected and/or fund are 0 ...)
   * / so 32603 will be triggered before error on tx (action of the user to confirm/reject)
   */
  const handleTx = (error, txHash) => {
    const { contractInstance, functionName, callbackObject } = data;

    const show = true;
    let type, msg;

    if (error) {
      //available info : error.code, error.msg
      let cause = "";
      switch (error.code) {
        case -32000:
        case -32603:
          cause = "the contract rejected the transaction";
          break;
        case 4001:
        case 4100:
          cause = "transaction or account not authorized by the user";
          break;
        case 4200:
        case 4900:
        case 4901:
          cause = "provider not connected or not supporting the method";
          break;
        default:
          break;
      }
      type = "error"; //or "warning" no chakra :"danger";
      msg = "Transaction failed : " + cause;
    } else {
      if (callbackObject) {
        if (callbackObject.callbackParam !== null) {
          callbackObject.callbackFunc(callbackObject.callbackParam);
        } else {
          callbackObject.callbackFunc();
        }
      }

      // if (isNeedingUpdate(functionName)) {
      //   console.log("HANDLE TX CALL UPDATE");
      //   // updateContractInfos(contractInstance);
      // }
      type = "success";
      msg = "Transaction processed / txHash : " + txHash;
    }
    // setDuration(6000);
    setStatus({
      sent: true,
      show: show,
      type: type,
      msg: msg,
    });
    // setIsVisible(true);
    doToast("Transaction processed", msg, type);
  };

  /**
   * @dev handles the closure of the alert
   */
  // const handleOnClose = useCallback(() => {
  //   const currentMsg = status.msg;
  //   setStatus({
  //     sent: true,
  //     show: false,
  //     type: "",
  //     msg: null,
  //   });
  //   if (!currentMsg.includes("initialized")) {
  //     closeTx(data.id);
  //   }
  //   setIsVisible(false);
  //   onClose();
  // }, [closeTx, data.id, status.msg]);

  /**
   * @todo : change the way the tx is initialized (rendering issue when strict mode)
   */
  useEffect(() => {
    console.log("useEffect TX MANAGER FIRST TIME");
  }, []);

  useLayoutEffect(() => {
    console.log("useLayoutEffect initTransaction");
    if (!status.sent) {
      setStatus((old) => ({ ...old, sent: true }));
      initTransaction();
    }
  }, [status.sent, initTransaction]);

  // useEffect(() => {
  //   console.log("useEffect initTransaction");
  //   let timer;
  //   if (status.show) {
  //     timer = setTimeout(() => {
  //       setIsVisible(false);
  //       onClose(); //handleOnClose();
  //     }, duration);
  //     // setTimer(timer);
  //   }
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [status.show, handleOnClose]); //, onClose()]); // handleOnClose]);

  return (
    // <>
    //   {status.show ? (
    //     <Alert status={status.type} style={{ fontSize: "0.8em" }}>
    //       <AlertIcon />

    //       <AlertDescription>{status.msg}</AlertDescription>

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
    <>
      {/* <Box>BIDOUILLAGE A RATTRAPER</Box> */}
      <Show below="sm">
        <Box>SCREEN TO SMALL</Box>
      </Show>
      {/* <Hide below="sm">
        <Box>FAKETEXT</Box>
      </Hide> */}
    </>
  );
}
