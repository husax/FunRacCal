import React from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const MsgModal = ({show, msg, ...props}) => {
  return (
    <Modal
      show={show}
      onHide={props.onClose}
      backdrop="static"
      animation={true}
    >
      <Modal.Header className="bg-danger" closeButton>
        <Modal.Title>Expresión errónea </Modal.Title>
      </Modal.Header>
      <Modal.Body>{msg}</Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={props.onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
};

export default MsgModal;