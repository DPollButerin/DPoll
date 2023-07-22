import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";

import PropTypes from "prop-types";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useDisclosure,
} from "@chakra-ui/react";
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
 */
export default function TxManager({ data, closeTx, setAlertInvalidTx }) {
  /* the tx has/not been sent, corresponding function, tx description */
  const [status, setStatus] = useState({
    sent: false,
    show: false,
    type: "",
    msg: "",
  });
  const [duration, setDuration] = useState(null);
  const { updateContractInfos } = useContracts();

  const {
    isOpen, //isVisible,
    onClose,
    onOpen,
  } = useDisclosure({ defaultIsOpen: true });

  const isNeedingUpdate = (funcName) => {
    let needUpdate = false;
    switch (funcName) {
      case "AddVoter":
        needUpdate = true;
        break;
      case "startProposalsRegistering":
        needUpdate = true;
        break;
      case "endProposalsRegistering":
        needUpdate = true;
        break;
      case "startVotingSession":
        needUpdate = true;
        break;
      case "endVotingSession":
        needUpdate = true;
        break;

      default:
        break;
    }
    return needUpdate;
  };
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
      const type = "secondary";
      // let msg;

      let msg = `Transaction initialized : ${functionName}\nparams: ${params}`;
      contractInstance.methods[functionName](params)
        .send({ from: fromAccount, value: value }, handleTx)
        .on("error", function (e) {
          console.log("initTransaction/ error", e);
          setAlertInvalidTx(`Invalid Tx: ${functionName} rejected`);
        });

      // switch (functionName) {
      //   case "addVoter":
      //     msg = "Transaction initialized : adding voter";
      //     contractInstance.methods
      //       .addVoter(params)
      //       .send({ from: fromAccount, value: value }, handleTx)
      //       .on("error", function (e) {
      //         console.log("initTransaction/ error", e);
      //         setAlertInvalidTx("Invalid Tx: adding voter rejected");
      //       });
      //     break;
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
      setDuration(3000);
      setStatus({
        sent: true,
        show: show,
        type: type,
        msg: msg,
      });
    },
    [data, setAlertInvalidTx]
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

      if (isNeedingUpdate(functionName)) {
        console.log("HANDLE TX CALL UPDATE");
        updateContractInfos(contractInstance);
      }
      type = "success";
      msg = "Transaction processed / txHash : " + txHash;
    }
    setDuration(6000);
    setStatus({
      sent: true,
      show: show,
      type: type,
      msg: msg,
    });
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
  // }, [closeTx, data.id, status.msg]);

  /**
   * @todo : change the way the tx is initialized (rendering issue when strict mode)
   */
  useLayoutEffect(() => {
    if (!status.sent) {
      initTransaction();
    }
  }, [status.sent, initTransaction]);

  useEffect(() => {
    let timer;
    if (status.show) {
      timer = setTimeout(() => {
        onClose(); //handleOnClose();
      }, duration);
      // setTimer(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [status.show, onClose()]); // handleOnClose]);

  return (
    <>
      {status.show ? (
        <Alert
          status={status.type}
          // variant={status.type}
          // onClose={handleOnClose}
          // dismissible
          style={{ fontSize: "0.8em", lineHeight: "2em", overflow: "auto" }}
        >
          <AlertIcon />
          <AlertDescription>{status.msg}</AlertDescription>
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={onClose}
          />
        </Alert>
      ) : null}
    </>
  );
}

// <>
//   {status.show ? (
//     <Alert
//       status={status.type}
//       variant={status.type}
//       onClose={handleOnClose}
//       dismissible
//       style={{ fontSize: "0.8em", lineHeight: "2em", overflow: "auto" }}
//     >
//       {status.msg}
//     </Alert>
//   ) : null}
// </>;

TxManager.propTypes = {
  data: PropTypes.object,
  close: PropTypes.func,
};
