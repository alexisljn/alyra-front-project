import {Contract, ethers, providers} from "ethers";
import {DEFAULT_ADDRESS, formatAddressWithChecksum, mappingBetweenStatusAndLabels} from "../Util";
import {
    handleAccountsChanged,
    handleChainChanged, handleProposalRegistered,
    handleVoterRegistered,
    handleWorkflowStatusChange
} from "../EventHandlers";

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

        ContractManager.listenContractEvents();
    }

    static resetContract() {
        ContractManager.cleanContractEvents();

        ContractManager.contract = null;
    }

    static async isCurrentUserOwner(userAddress: string) {
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

    static async changeVotingStatus(status: number) {
        const signer = ContractManager.provider.getSigner();

        const contractWithSigner = ContractManager.contract!.connect(signer);

        await contractWithSigner[mappingBetweenStatusAndLabels[status].functionName!]()
    }

    static async addVoter(address: string) {
        const signer = ContractManager.provider.getSigner();

        const contractWithSigner = ContractManager.contract!.connect(signer);

        await contractWithSigner.addVoter(address);
    }

    static async getVoter(address: string) {
        if (ContractManager.contract) {
            return await ContractManager.contract.getVoter(address);
        }
    }

    static async addProposal(description: string) {
        const signer = ContractManager.provider.getSigner();

        const contractWithSigner = ContractManager.contract!.connect(signer);

        await contractWithSigner.addProposal(description);
    }

    static listenProviderEvents() {
        window.ethereum.on('chainChanged', handleChainChanged);

        window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    static cleanProviderEvents() {
        window.ethereum.off('chainChanged', handleChainChanged);

        window.ethereum.off("accountsChanged", handleAccountsChanged);
    }

    static listenContractEvents() {
        ContractManager.contract!.on('WorkflowStatusChange', handleWorkflowStatusChange);

        ContractManager.contract!.on('VoterRegistered', handleVoterRegistered);

        ContractManager.contract!.on('ProposalRegistered', handleProposalRegistered);
    }

    static cleanContractEvents() {
        ContractManager.contract!.off('WorkflowStatusChange', handleWorkflowStatusChange);

        ContractManager.contract!.off('VoterRegistered', handleVoterRegistered);

        ContractManager.contract!.off('ProposalRegistered', handleProposalRegistered);
    }

    static cleanEvents() {
        ContractManager.cleanProviderEvents();

        ContractManager.cleanContractEvents();
    }
}

export {ContractManager};
