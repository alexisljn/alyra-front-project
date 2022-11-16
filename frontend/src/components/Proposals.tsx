import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "../App";
import {fireToast, isChainIdCorrect, mappingBetweenStatusAndLabels, VotingStatus} from "../Util";
import {ContractManager} from "../managers/ContractManager";
import LoadingModal from "./LoadingModal";

function Proposals() {

    const [showLoadingModal, setShowLoadingModal] = useState(false);

    const [proposals, setProposals] = useState<Array<string>>([]);

    const {chainId, votingStatus} = useContext(UserContext);

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

                throw new Error();

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
                setShowLoadingModal(false);

                fireToast('success', 'Success ! Proposal has been submitted');

                if (ContractManager.contract) {
                    const proposals = await ContractManager.getProposals();

                    setProposals(proposals)
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
                            <div>Listing proposals (TODO)</div>
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
