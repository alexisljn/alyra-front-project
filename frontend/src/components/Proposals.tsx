import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "../App";
import {fireToast, isChainIdCorrect, mappingBetweenStatusAndLabels, VotingStatus} from "../Util";
import {ContractManager} from "../managers/ContractManager";
import LoadingModal from "./LoadingModal";

function Proposals() {

    const [showLoadingModal, setShowLoadingModal] = useState(false);

    const [proposals, setProposals] = useState<Array<string>>([]);

    const {chainId, votingStatus, address} = useContext(UserContext);

    const addProposalTextAreaRef = useRef<HTMLTextAreaElement>(null);

    const closeModal = useCallback(() => {
        setShowLoadingModal(false);
    }, []);

    const addProposal = useCallback(async () => {
        if (addProposalTextAreaRef.current) {
            try {
                if (addProposalTextAreaRef.current.value === '') {
                    throw new Error('Proposal can\'t be empty');
                }

                if (ContractManager.contract) {

                    await ContractManager.addProposal(addProposalTextAreaRef.current.value);

                    setShowLoadingModal(true);

                    return;
                }

                throw new Error('Something went wrong');

            } catch (error: Error | any) {
                if (error.hasOwnProperty('error')) {

                    fireToast('error', error.error.data.message);

                    return;
                }

                fireToast('error', error.message);
            }
        }
    }, []);

    const handleLocalEvents = useCallback(async (e: any) => {
        switch (e.type) {
            case 'proposalRegistrationSuccess':
                if (address === e.detail.value) {
                    setShowLoadingModal(false);

                    fireToast('success', 'Success ! Proposal has been submitted');
                }

                if (ContractManager.contract) {
                    const proposals = await ContractManager.getProposals();

                    setProposals(proposals);
                }

                break;
            case 'votedSuccess':
                if (address === e.detail.value) {
                    setShowLoadingModal(false);

                    fireToast('success', 'Success ! Your vote has been saved');
                }

                break;
        }
    }, []);

    useEffect(() => {
        (async () => {

            if (ContractManager.contract) {
                const proposals = await ContractManager.getProposals();

                setProposals(proposals)
            }

            window.addEventListener('proposalRegistrationSuccess', handleLocalEvents);
        })();

        return () => {
            window.removeEventListener('proposalRegistrationSuccess', handleLocalEvents);
        }
    }, []);

    return (
        <div>
            <h2>Proposals</h2>
            <p>Current voting status : {mappingBetweenStatusAndLabels[votingStatus!].label}</p>
            {isChainIdCorrect(chainId)
                ?
                    <>
                        {showLoadingModal && <LoadingModal showModal={showLoadingModal} closeModal={closeModal}/>}
                        <div>
                            <div>
                                <h4>Current proposals</h4>
                                {proposals.length > 0
                                    ?
                                        <div className="mb-2 d-flex">
                                            {proposals.map((proposal, index) => (
                                                <div key={index} className="card col-2 me-3">
                                                    <div className="card-body">
                                                        <p className="card-text">{proposal}</p>
                                                    </div>
                                                    <div className="ms-2 mb-2 mt-1">
                                                        <button className="btn btn-sm btn-primary">Vote</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    :
                                        <p>There's currently no proposal</p>
                                }
                            </div>
                            <div className="mt-4">
                                <h4>Add proposal</h4>
                                {votingStatus === VotingStatus.ProposalsRegistrationStarted
                                    ?
                                        <div>
                                            <div className="col-6 mb-2">
                                                <label htmlFor="add-proposal-textarea" className="form-label"></label>
                                                <textarea className="form-control"
                                                          id="add-proposal-textarea"
                                                          placeholder="Description..."
                                                          rows={3}
                                                          ref={addProposalTextAreaRef}></textarea>
                                            </div>
                                            <button className="btn btn-primary" onClick={addProposal}>Submit</button>
                                        </div>
                                    :
                                        <p>You can't add proposals</p>
                                }
                            </div>
                        </div>
                    </>
                :
                    <div><p>Change network</p></div> //TODO
            }
        </div>
    )
}

export default Proposals;
