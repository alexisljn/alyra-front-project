import React, {useCallback, useContext, useEffect, useState} from "react";
import {UserContext} from "../App";
import {getNextVotingStatus, isChainIdCorrect, mappingBetweenStatusAndLabels} from "../Util";
import {ContractManager} from "../managers/ContractManager";
import LoadingModal from "./LoadingModal";
import {Spinner} from "react-bootstrap";

function AdminPanel() {

    const [isLoading, setIsLoading] = useState(true);

    const {
        isAdmin,
        votingStatus,
        chainId,
        displayTransactionLoadingModal,
        toggleDisplayTransactionLoadingModal
    } = useContext(UserContext);

    const changeVotingStatus = useCallback(async (status: number) => {
        try {

            if (status != getNextVotingStatus(votingStatus!)) {
                throw new Error('Invalid voting status')
            }

            if (ContractManager.contract) {
                await ContractManager.changeVotingStatus(status);

                toggleDisplayTransactionLoadingModal();

                return
            }

            throw new Error('Contract instance not available')

        } catch (error) {
            console.log("trigger si revert ") // OUI ! TODO
            console.error(error);
        }
    }, [votingStatus]);

    useEffect(() => {
        if (!isAdmin) {
            window.location.href = '/not-found';
            return;
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            window.location.href = '/unauthorized';
            return;
        }
    }, [isAdmin])

    return (
        isLoading
            ?
                <div className="d-flex justify-content-center">
                    <Spinner animation="border"></Spinner>
                </div>

    )
}

export default AdminPanel;
