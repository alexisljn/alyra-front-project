import {ethers} from "ethers";
import Swal from 'sweetalert2';

const ADDRESSES_LABEL: string = 'addresses';

const DEFAULT_ADDRESS: string = '0x';

interface LocalStorageItem {
    [key: string]: number
}

enum VotingStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
}

const mappingBetweenStatusAndLabels: {[key: number]: {label: string, functionName: string | null}} = {
    [VotingStatus.RegisteringVoters]: {label: 'Registering voters', functionName: null},
    [VotingStatus.ProposalsRegistrationStarted]: {label: 'Proposals registration started', functionName: 'startProposalsRegistering'},
    [VotingStatus.ProposalsRegistrationEnded]: {label: 'Proposals registration ended', functionName: 'endProposalsRegistering'},
    [VotingStatus.VotingSessionStarted]: {label: 'Voting session started', functionName: 'startVotingSession'},
    [VotingStatus.VotingSessionEnded]: {label: 'Voting session ended', functionName: 'endVotingSession'},
    [VotingStatus.VotesTallied]: {label: 'Votes tallied', functionName: null}
}

function saveAddressInLocalStorage(address: string) {
    if (address === DEFAULT_ADDRESS) return;

    const savedAddresses: string | null = window.localStorage.getItem(ADDRESSES_LABEL);

    const timestamp: number = Date.now();

    if (savedAddresses !== null) {
        const savedAddressesObject: LocalStorageItem = JSON.parse(savedAddresses);

        savedAddressesObject[formatAddressWithChecksum(address)] = timestamp;

        window.localStorage.setItem(ADDRESSES_LABEL, JSON.stringify(savedAddressesObject))

        return;
    }

    window.localStorage.setItem(ADDRESSES_LABEL, JSON.stringify({[formatAddressWithChecksum(address)]: timestamp}));
}

function removeAddressFromLocalStorage(address: string) {
    const savedAddresses: string | null = window.localStorage.getItem(ADDRESSES_LABEL);

    if (savedAddresses !== null) {

        const savedAddressesObject: LocalStorageItem = JSON.parse(savedAddresses);

        if (savedAddressesObject[formatAddressWithChecksum(address)]) {

            delete savedAddressesObject[formatAddressWithChecksum(address)];

            Object.keys(savedAddressesObject).length > 0
                ? window.localStorage.setItem(ADDRESSES_LABEL, JSON.stringify(savedAddressesObject))
                : window.localStorage.removeItem(ADDRESSES_LABEL)
            ;
        }
    }
}

function getLastUsedAddress() {
    const savedAddresses: string | null = window.localStorage.getItem(ADDRESSES_LABEL);

    let lastUsedAddress: string = DEFAULT_ADDRESS;

    if (savedAddresses !== null) {

        const savedAddressesObject: LocalStorageItem = JSON.parse(savedAddresses);

        let lastUsedTimestamp: number = 0;

        for (const [address, timestamp] of Object.entries(savedAddressesObject)) {

            if (timestamp > lastUsedTimestamp) {

                lastUsedAddress = address;

                lastUsedTimestamp = timestamp;
            }
        }

    }

    return lastUsedAddress;
}

function isChainIdCorrect(chainId: number): boolean {
    return chainId === Number(process.env.REACT_APP_CHAIN_ID)
}

function getChainIdName(chainId: number): string|null {
    switch (chainId) {
        case 5: return 'Goerli';

        case 31337: return 'Localhost';

        default: return null
    }
}

function formatAddressWithChecksum(address: string) {
    return ethers.utils.getAddress(address);
}

function getNextVotingStatus(currentStatus: VotingStatus) {
    if (currentStatus === VotingStatus.VotesTallied) {
        return null
    }

    return currentStatus + 1;
}

type toastType = "success" | "error" | "warning"

function fireToast(type: toastType, text: string) {
    const bgColor: {[key: string]: string} = {success: '#28a745', error: '#dc3545', warning: '#ffc107'};

    const textColor = {success: 'white', error: 'white', warning: '#343a40'};

    Swal.fire({
        title: text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: bgColor[type],
        color: textColor[type]
    });
}

export {
    saveAddressInLocalStorage,
    removeAddressFromLocalStorage,
    getLastUsedAddress,
    isChainIdCorrect,
    getChainIdName,
    formatAddressWithChecksum,
    getNextVotingStatus,
    VotingStatus,
    fireToast,
    mappingBetweenStatusAndLabels,
    DEFAULT_ADDRESS
}
