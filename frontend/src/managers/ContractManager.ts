import {Contract, ethers, providers} from "ethers";
import {DEFAULT_ADDRESS} from "../Util";

class ContractManager {

    static provider: providers.Web3Provider;

    static contract: Contract;

    static setProvider() {
        ContractManager.provider = new providers.Web3Provider(window.ethereum);
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

}

export {ContractManager};
