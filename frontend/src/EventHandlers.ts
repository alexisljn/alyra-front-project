import {ethers} from "ethers";

const PROVIDER_EVENT = 'providerEvent';

const CONTRACT_EVENT = 'contractEvent'

function handleChainChanged(hexChainId: any) {
    const chainId = parseInt(ethers.BigNumber.from(hexChainId).toString());

    const event = new CustomEvent(PROVIDER_EVENT, {detail: {type: 'chainChanged', value: chainId}});

    window.dispatchEvent(event);
}

function handleAccountsChanged(accounts: any) {
    const address = String(accounts[0]);

    const event = new CustomEvent(PROVIDER_EVENT, {detail: {type: 'accountsChanged', value: address}});

    window.dispatchEvent(event);
}

function handleWorkflowStatusChange(oldStatus: number, newStatus: number) {
    const event = new CustomEvent(CONTRACT_EVENT, {detail: {type: 'workflowStatusChange', value: newStatus}});

    const localEvent = new CustomEvent('votingStatusChangeSuccess', {detail: {value: {oldStatus, newStatus}}});

    window.dispatchEvent(event);

    window.dispatchEvent(localEvent);
}

function handleVoterRegistered(address: string) {
    const localEvent = new CustomEvent('voterRegistrationSuccess', {detail: {value: address}});

    window.dispatchEvent(localEvent);
}

export {
    handleChainChanged,
    handleAccountsChanged,
    handleWorkflowStatusChange,
    handleVoterRegistered,
    PROVIDER_EVENT,
    CONTRACT_EVENT
};

