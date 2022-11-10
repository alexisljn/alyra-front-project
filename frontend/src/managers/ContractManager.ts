import {Contract, ethers, providers} from "ethers";
import {DEFAULT_ADDRESS} from "../Util";

class ContractManager {

    static provider: providers.Web3Provider;

    static contract: Contract;

    static setProvider() {
        ContractManager.provider = new providers.Web3Provider(window.ethereum);
    }

}

export {ContractManager};
