import React, { useState, createContext } from "react";

import TxManager from "./TxManager";
import EventManager from "./EventManager";
import InvalidTx from "./InvalidTx";

const TxContext = createContext();

/**
 * @dev Manages the queue of transactions
 *
 * - stores the transactions and their status
 * - triggers TxManager to initiate a new Tx
 *
 * - stores events binded to transacations and their status
 * - triggers TxEvent to initiate a new event listener
 *
 * - forwards the result of an event if needed
 *
 * @param {any} props
 *
 * @todo : remove closed Tx from the array via txManager (Attention : manage id a different way)
 * @todo : refactor setInvalidTx
 * @todo : refactor eventManager (close form context or manager) =>forward info no more util ..
 */
export function TxProvider(props) {
  /*array of transactions*/
  const [txArray, setTxArray] = useState([]);
  //   {
  //     id: 0,
  //     processing: false,
  //     contractInstance: null,
  //     functionName: "",
  //     params: [],
  //     fromAccount: null,
  //     value: null,
  //     callbackObject: null,
  //   },
  // ]);
  /*tx validation state*/
  const [alertInvalidTx, setAlertInvalidTx] = useState("");
  /*events*/
  const [event, setEvent] = useState({
    status: "", //modif processing
    instance: null,
    name: "",
  });
  /*resutl of event to forward 
  @todo : remove (change way to manage close events)
  */
  const [test, setTest] = useState(null);

  /**
   * @dev stores and triggers new transactions
   *
   * @param {web3} instance
   * @param {string} functionName
   * @param {any} params
   */
  const initTx = (
    contractInstance,
    functionName,
    params,
    fromAccount,
    value,
    callbackObject = null
  ) => {
    console.log("initTx", contractInstance, functionName, params);
    setTxArray((oldArray) => {
      const newArray = [...oldArray];
      newArray.push({
        id: oldArray.length,
        processing: true,
        contractInstance: contractInstance,
        functionName: functionName,
        params: [...params],
        fromAccount: fromAccount,
        value: value,
        callbackObject: callbackObject,
      });
      return newArray;
    });
  };

  /**
   * @dev set the status of tx to done (processing = false)
   *
   * @param {number} id
   */
  const closeTx = (id) => {
    setTxArray((oldArray) => {
      const newArray = [...oldArray];
      newArray[id].processing = false;
      return newArray;
    });
  };

  /**
   * @dev set an event listener
   *
   * - callback is used when we need to exploit/forward the event result
   *
   * @param {web3} instance
   * @param {string} name
   */
  const subscribeEvent = (instance, name, callback = null) => {
    console.log("subscribeEvent", instance, name);
    setEvent({
      processing: true,
      instance: instance,
      name: name,
      // callback: callback
    });
  };

  /**
   * manage the result event (forward/close)
   *
   * @param {*} event data received
   */
  const forwardEventResult = (eventData) => {
    setTest(eventData);
  };

  const closeEventResult = () => {
    setTest(null);
  };

  return (
    <>
      <TxContext.Provider
        value={{
          initTx,
          subscribeEvent,
          alertInvalidTx,
          setAlertInvalidTx,
        }}
      >
        <InvalidTx></InvalidTx>

        {props.children}

        <div className="row">
          <div className="col-6">
            {txArray
              ? txArray.map((tx) => {
                  if (tx.processing) {
                    return (
                      <TxManager
                        key={tx.id}
                        data={tx}
                        setAlertInvalidTx={setAlertInvalidTx}
                        closeTx={closeTx}
                        style={{ fontSize: "0.2em" }}
                      ></TxManager>
                    );
                  } else {
                    return null;
                  }
                })
              : null}
          </div>
          <div className="col-6">
            {event.processing ? (
              <EventManager
                data={event}
                forwardEventResult={forwardEventResult}
                style={{ fontSize: "0.2em" }}
              ></EventManager>
            ) : null}
          </div>
        </div>
      </TxContext.Provider>
    </>
  );
}

export default TxContext;
