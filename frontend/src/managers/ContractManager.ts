import {Contract, ethers, providers} from "ethers";
import {DEFAULT_ADDRESS, formatAddressWithChecksum} from "../Util";
import {handleAccountsChanged, handleChainChanged, handleWorkflowStatusChange} from "../EventHandlers";

class ContractManager {

    static provider: providers.Web3Provider;

    static contract: Contract | null;

    static initiateProvider() {
        ContractManager.provider = new providers.Web3Provider(window.ethereum);

        ContractManager.listenProviderEvents();
    }

    static async getAbi() {
        const response = await fetch('artifacts/contracts/voting.sol/Voting.json');

        const contractArtifact = await response.json()

        return contractArtifact.abi;
    }

    static async attachToContract() {
        ContractManager.contract = new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS || DEFAULT_ADDRESS,
            await ContractManager.getAbi(),
            ContractManager.provider
        )
    }

    static resetContract() {
        ContractManager.contract = null;
    }

    static async isCurrentUserOwner(userAddress: string) {
        //TODO si bon chainId sinon false
        if (userAddress === DEFAULT_ADDRESS || !ContractManager.contract) {
            return false;
        }

        const owner: string = await ContractManager.contract.owner();

        return formatAddressWithChecksum(userAddress) === owner;
    }

    static async getVotingStatus(): Promise<number | null> {
        if (ContractManager.contract) {
            return await ContractManager.contract.workflowStatus();
        }

        return null;
    }

    static listenProviderEvents() {
        window.ethereum.on('chainChanged', handleChainChanged);

        window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    static cleanProviderEvents() {
        window.ethereum.off('chainChanged', handleChainChanged);

        window.ethereum.off("accountsChanged", handleAccountsChanged);
    }

}

export {ContractManager};
