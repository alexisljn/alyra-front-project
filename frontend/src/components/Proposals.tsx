import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "../App";
import {fireToast, getChainIdName, isChainIdCorrect, mappingBetweenStatusAndLabels, VotingStatus} from "../Util";
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

    const setVote = useCallback(async (e: any) => {
        try {
            const proposalId = parseInt(e.target.getAttribute('data-index'));

            if (ContractManager.contract) {
                await ContractManager.setVote(proposalId);

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

            window.addEventListener('votedSuccess', handleLocalEvents);
        })();

        return () => {
            window.removeEventListener('proposalRegistrationSuccess', handleLocalEvents);

            window.removeEventListener('votedSuccess', handleLocalEvents);
        }
    }, []);

    return (
        appLoading
            ?
                <div></div>
            :
                <div>
                    <h2>Proposals</h2>
                    {isChainIdCorrect(chainId)
                        ?
                        <>
                            {showLoadingModal && <LoadingModal showModal={showLoadingModal} closeModal={closeModal}/>}
                            <div>
                                <p>Current voting status : {mappingBetweenStatusAndLabels[votingStatus].label}</p>
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
                                                        <button data-index={index} className="btn btn-sm btn-primary"
                                                                onClick={(event) => setVote(event)}
                                                        >
                                                            Vote
                                                        </button>
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
                                <div className="mt-4">
                                    <h4>Winning proposal</h4>
                                    {votingStatus === VotingStatus.VotesTallied && winningProposal
                                        ?   <div>
                                                <p className="lead">{winningProposal.description}</p>
                                                <p>vote count : {winningProposal.voteCount}</p>
                                            </div>
                                        : <p>Voting is not yet over</p>
                                    }
                                </div>
                            </div>
                        </>
                        :
                        <div><p>Change network to {getChainIdName(parseInt(process.env.REACT_APP_CHAIN_ID!))}</p></div>
                    }
                </div>
    )
}

export default Proposals;
