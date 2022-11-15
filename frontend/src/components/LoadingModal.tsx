import React, {useContext} from "react";
import {Modal, Spinner} from "react-bootstrap";
import {UserContext} from "../App";

function LoadingModal() {

    const {displayTransactionLoadingModal, toggleDisplayTransactionLoadingModal} = useContext(UserContext);

    return (
        <Modal
            show={displayTransactionLoadingModal}
            onHide={toggleDisplayTransactionLoadingModal}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    Transaction in progress
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center">
                    <Spinner animation="border"></Spinner>
                </div>
                <div className="mt-3">
                    <p>This popup will close automatically when transaction has been completed</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-primary" onClick={toggleDisplayTransactionLoadingModal}>Close</button>
            </Modal.Footer>
        </Modal>
    )
}

export default LoadingModal;
