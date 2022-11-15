import React, {createContext, useCallback, useEffect, useState} from 'react';
import './App.css';
import Header from "./components/Header";
import {
    DEFAULT_ADDRESS,
    getLastUsedAddress,
    isChainIdCorrect,
    saveAddressInLocalStorage
} from "./Util";
import {ContractManager} from "./managers/ContractManager";
import {Route, Routes} from "react-router-dom";
import Home from "./components/Home";
import AdminPanel from "./components/AdminPanel";
import ErrorPage from "./components/ErrorPage";
import {CONTRACT_EVENT, PROVIDER_EVENT} from "./EventHandlers";

interface UserContext {
    isLogged: boolean
    address: string
    chainId: number
    isAdmin: boolean
    votingStatus: number | null
    toggleIsLogged: () => void
    changeAddress: (address: string) => void
}

const UserContext = createContext<UserContext>({
    isLogged: false,
    address: DEFAULT_ADDRESS,
    chainId: 0,
    isAdmin: false,
    votingStatus: null,
    toggleIsLogged: () => {},
    changeAddress: () => {},
});

function App() {

    const [isLogged, setIsLogged] = useState(false);

    const [address, setAddress] = useState(DEFAULT_ADDRESS);

    const [isAdmin, setIsAdmin] = useState(false);

    const [chainId, setChainId] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const [votingStatus, setVotingStatus] = useState<number | null>(null);

    const toggleIsLogged = useCallback(() => {
        setIsLogged(isLogged => !isLogged);
    }, []);

    const changeAddress = useCallback((address: string) => {
        setAddress(address);
    }, []);

    const handleAutoLogin = useCallback(async (): Promise<string> => {
        const lastUsedAddress = getLastUsedAddress();

        if (lastUsedAddress !== DEFAULT_ADDRESS) {
            setAddress(lastUsedAddress);

            toggleIsLogged();
        }

        return lastUsedAddress;
    }, [])

    const initialization = useCallback(async () => {
        const lastUsedAddress = await handleAutoLogin();

        const {chainId} = await ContractManager.provider.getNetwork()

        setChainId(chainId);

        if (isChainIdCorrect(chainId)) {
            await ContractManager.attachToContract();

            setIsAdmin(await ContractManager.isCurrentUserOwner(lastUsedAddress));
        } else {
            throw new Error("Bad network") //TODO
        }
    }, []);

    const handleProviderEvents = useCallback((e: any) => {
        switch (e.detail.type) {
            case 'chainChanged':
                setChainId(e.detail.value);
                break;
            case 'accountsChanged':
                setAddress(e.detail.value);
                break;
        }
    }, []);

    const handleContractEvents = useCallback((e: any) => {
        switch (e.detail.type) {

        }
    }, []);

    useEffect(() => {
        (async () => {
            if (window.hasOwnProperty('ethereum')) {
                ContractManager.initiateProvider()

                try {
                    await initialization()
                } catch (error) {
                    alert('Couldn\'t connect to contract'); //TODO reseau

                    console.error(error);
                }

                window.addEventListener(PROVIDER_EVENT, handleProviderEvents);

                window.addEventListener(CONTRACT_EVENT, handleContractEvents);

                setIsLoading(false);
            }
        })();

        return () => {
            window.removeEventListener(PROVIDER_EVENT, handleProviderEvents);

            window.removeEventListener(CONTRACT_EVENT, handleContractEvents);

            ContractManager.cleanEvents();
        }
    }, []);

    useEffect(() => {
        if (isLoading) return; /* Initialization Guard */

        (async () => {
            if (isChainIdCorrect(chainId)) {
                await ContractManager.attachToContract();

                setIsAdmin(await ContractManager.isCurrentUserOwner(address));

                return;
            }

            ContractManager.resetContract();

            setIsAdmin(false);

            //TODO alert pour dire d'être sur le bon reseau
        })();
    }, [chainId]);

    useEffect(() => {
        if (isLoading) return; /* Initialization Guard */

        (async () => {
            saveAddressInLocalStorage(address);

            isChainIdCorrect(chainId)
                ? setIsAdmin(await ContractManager.isCurrentUserOwner(address))
                : setIsAdmin(false)
            ;
        })();
    }, [address])

    return(
        <>
            <UserContext.Provider value={{isLogged, toggleIsLogged, address, changeAddress, isAdmin, chainId}}>
                <Header/>
                <div className="container-fluid mt-3">
                    {!isLoading &&
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="admin" element={<AdminPanel/>}/>
                            <Route path="*" element={<ErrorPage/>}/>
                        </Routes>
                    }
                </div>
            </UserContext.Provider>
        </>
    );
}

export {App, UserContext};
