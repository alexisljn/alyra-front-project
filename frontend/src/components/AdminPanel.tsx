import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "../App";
import {
    fireToast,
    formatAddressWithChecksum,
    getNextVotingStatus,
    isChainIdCorrect,
    mappingBetweenStatusAndLabels,
    VotingStatus
} from "../Util";
import {ContractManager} from "../managers/ContractManager";
import LoadingModal from "./LoadingModal";
import {Spinner} from "react-bootstrap";

function AdminPanel() {

    const [isLoading, setIsLoading] = useState(true);

    const [showLoadingModal, setShowLoadingModal] = useState(false);

    const addVoterInputRef = useRef<HTMLInputElement>(null);

    const {
        isAdmin,
        votingStatus,
        chainId,
        address
    } = useContext(UserContext);

    const closeModal = useCallback(() => {
        setShowLoadingModal(false);
    }, []);

    const changeVotingStatus = useCallback(async (status: number) => {
        try {

            if (status != getNextVotingStatus(votingStatus!)) {
                throw new Error('Invalid voting status')
            }

            if (ContractManager.contract) {
                await ContractManager.changeVotingStatus(status);

                setShowLoadingModal(true);

                return
            }

            throw new Error();

        } catch (error: Error | any) {
            if (error.hasOwnProperty('error')) {
                fireToast('error', error.error.data.message);

                return;
            }

            fireToast('error', 'Error ! Something went wrong');
        }
    }, [votingStatus]);

    const addVoter = useCallback(async () => {
        if (addVoterInputRef.current) {
            try {
                const address = formatAddressWithChecksum(addVoterInputRef.current.value);

                if (ContractManager.contract) {
                    await ContractManager.addVoter(address)

                    setShowLoadingModal(true);

                    return;
                }

                throw new Error();

            } catch (error: Error | any) {
                if (error.hasOwnProperty('error')) {
                    fireToast('error', error.error.data.message);

                    return;
                }

                if (error.message.includes('invalid address')) {
                    fireToast('error', `Error ! ${addVoterInputRef.current.value} is not a valid address`);

                    return;
                }

                fireToast('error', 'Error ! Something went wrong');
            }
        }

    }, []);

    const tallyVotes = useCallback(async () => {
        try {

            if (ContractManager.contract) {
                await ContractManager.tallyVotes();

                setShowLoadingModal(true);

                return
            }

            throw new Error('Something went wrong')

        } catch (error: Error | any) {
            if (error.hasOwnProperty('error')) {
                fireToast('error', error.error.data.message);

                return;
            }

            fireToast('error', 'Error ! Something went wrong');
        }
    }, []);

    const handleLocalEvents = useCallback((e: any) => {
        switch (e.type) {
            case 'voterRegistrationSuccess':
                if (address === e.detail.value.registeredBy) {
                    closeModal();

                    fireToast('success', `Success ! ${e.detail.value.address} has been added as a voter`);
                }

                break;
            case 'votingStatusChangeSuccess':
                closeModal();

                const oldStatus = mappingBetweenStatusAndLabels[e.detail.value.oldStatus].label;

                const newStatus = mappingBetweenStatusAndLabels[e.detail.value.newStatus].label;

                fireToast('success', `Success ! status change from ${oldStatus} to ${newStatus}`);

                break;
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            window.location.href = '/not-found';
            return;
        }

        window.addEventListener('voterRegistrationSuccess', handleLocalEvents);

        window.addEventListener('votingStatusChangeSuccess', handleLocalEvents);

        setIsLoading(false);

        return () => {
            window.removeEventListener('voterRegistrationSuccess', handleLocalEvents);

            window.removeEventListener('votingStatusChangeSuccess', handleLocalEvents);
        }
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
            :
                <>
                    {showLoadingModal && <LoadingModal showModal={showLoadingModal} closeModal={closeModal}/>}
                    <div>
                        <h2>Admin panel</h2>
                        {isChainIdCorrect(chainId) &&
                            <div>
                                <p>Current voting status : {mappingBetweenStatusAndLabels[votingStatus!].label}</p>
                                <div className="mt-3">
                                    <h4>Change voting status</h4>
                                    <div className="mt-4">
                                        {Object.entries(mappingBetweenStatusAndLabels).map(([availableStatus, statusData]) => {
                                            return <button key={availableStatus}
                                                           className="btn btn-sm mx-2 btn-primary"
                                                           disabled={Number(availableStatus) !== getNextVotingStatus(votingStatus!)}
                                                           onClick={() => changeVotingStatus(Number(availableStatus))}
                                            >
                                                {statusData.label}
                                            </button>
                                        })}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4>Add voter</h4>
                                    {votingStatus === VotingStatus.RegisteringVoters
                                        ?
                                            <div className="d-flex align-items-end">
                                                <div className="mx-2 col-4">
                                                    <label htmlFor="add-voter-input" className="form-label">Address</label>
                                                    <input id="add-voter-input"
                                                           type="text"
                                                           className="form-control"
                                                           placeholder="0x..."
                                                           ref={addVoterInputRef}
                                                    />
                                                </div>
                                                <button className="btn btn-primary" onClick={addVoter}>Add</button>
                                            </div>
                                        :
                                            <p>You can't add voters anymore</p>
                                    }
                                </div>
                                <div className="mt-4">
                                    <h4>Tally votes</h4>
                                    {votingStatus === VotingStatus.VotingSessionEnded
                                        ? <button className="btn btn-primary" onClick={tallyVotes}>Tally votes</button>
                                        : <p>You can't tally votes now</p>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </>

    )
}

export default AdminPanel;
