import React, { useState, useLayoutEffect, useContext } from "react";

import Modal from "react-bootstrap/Modal";
import TxContext from "./TxContext";

/**
 * Pops up when a Tx is invalid
 *
 * - displays the cause of the invalidation
 *
 */
export default function InvalidTx() {
  const [show, setShow] = useState(false);
  const { alertInvalidTx, setAlertInvalidTx } = useContext(TxContext);

  const handleClose = () => {
    setShow(false);
    setAlertInvalidTx("");
  };

  useLayoutEffect(() => {
    if (alertInvalidTx !== "") {
      setShow(true);
    }
  }, [alertInvalidTx]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      animation={false}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {alertInvalidTx}
        </Modal.Title>
      </Modal.Header>
    </Modal>
  );
}
