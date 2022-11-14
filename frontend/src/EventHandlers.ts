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
    console.log(typeof  oldStatus, typeof newStatus)
    console.log('WorkflowStatusChange trigger', oldStatus, newStatus)

    const event = new CustomEvent(CONTRACT_EVENT, {detail: {type: 'accountsChanged', value: {oldStatus, newStatus}}});

    window.dispatchEvent(event);
}

export {handleChainChanged, handleAccountsChanged, handleWorkflowStatusChange, PROVIDER_EVENT, CONTRACT_EVENT};

