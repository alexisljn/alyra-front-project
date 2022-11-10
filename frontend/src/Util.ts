const ADDRESSES_LABEL: string = 'addresses';

const DEFAULT_ADDRESS: string = '0x';

interface LocalStorageItem {
    [key: string]: number
}

function saveAddressInLocalStorage(address: string) {
    const savedAddresses: string | null = window.localStorage.getItem(ADDRESSES_LABEL);

    const timestamp: number = Date.now();

    if (savedAddresses !== null) {
        const savedAddressesObject: LocalStorageItem = JSON.parse(savedAddresses);

        savedAddressesObject[address] = timestamp;

        window.localStorage.setItem(ADDRESSES_LABEL, JSON.stringify(savedAddressesObject))

        return;
    }

    window.localStorage.setItem(ADDRESSES_LABEL, JSON.stringify({[address]: timestamp}));
}

function removeAddressFromLocalStorage(address: string) {
    const savedAddresses: string | null = window.localStorage.getItem(ADDRESSES_LABEL);

    if (savedAddresses !== null) {

        const savedAddressesObject: LocalStorageItem = JSON.parse(savedAddresses);

        if (savedAddressesObject[address]) {

            delete savedAddressesObject[address];

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

export { saveAddressInLocalStorage, removeAddressFromLocalStorage, getLastUsedAddress, DEFAULT_ADDRESS }
