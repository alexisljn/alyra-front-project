import React, {createContext, useCallback, useEffect, useState} from 'react';
import './App.css';
import Header from "./components/Header";
import {
    DEFAULT_ADDRESS, fireToast, getChainIdName,
    getLastUsedAddress,
    isChainIdCorrect,
    saveAddressInLocalStorage
} from "./Util";
import {ContractManager} from "./managers/ContractManager";
import {Route, Routes} from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import ErrorPage from "./components/ErrorPage";
import {CONTRACT_EVENT, PROVIDER_EVENT} from "./EventHandlers";
import Proposals from "./components/Proposals";

interface UserContext {
    isLogged: boolean
    address: string
    chainId: number
    isAdmin: boolean
    appLoading: boolean
    votingStatus: number
    toggleIsLogged: () => void
    changeAddress: (address: string) => void
}

const UserContext = createContext<UserContext>({
    isLogged: false,
    address: DEFAULT_ADDRESS,
    chainId: 0,
    isAdmin: false,
    appLoading: true,
    votingStatus: 0,
    toggleIsLogged: () => {},
    changeAddress: () => {},
});

function App() {

    const [isLogged, setIsLogged] = useState(false);

    const [address, setAddress] = useState(DEFAULT_ADDRESS);

    const [isAdmin, setIsAdmin] = useState(false);

    const [chainId, setChainId] = useState(0);

    const [appLoading, setAppLoading] = useState(true);

    const [votingStatus, setVotingStatus] = useState(0);

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
    }, [toggleIsLogged])

    const initialization = useCallback(async () => {
        console.log('t1')
        const lastUsedAddress = await handleAutoLogin();
        console.log('t2')
        const {chainId} = await ContractManager.provider.getNetwork()
        console.log('t3')
        if (isChainIdCorrect(chainId)) {
            console.log('t4')
            setChainId(chainId);
            console.log('t5')
            await ContractManager.attachToContract();
            console.log('t6')
            setIsAdmin(await ContractManager.isCurrentUserOwner(lastUsedAddress));
            console.log('t7')
            setVotingStatus(await ContractManager.getVotingStatus());
        } else {
            throw new Error('Bad chain id');
        }
    }, [handleAutoLogin]);

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
            case 'workflowStatusChange':
                setVotingStatus(e.detail.value);
                break;
        }
    }, []);

    useEffect(() => {
        (async () => {
            if (window.hasOwnProperty('ethereum')) {
                console.log(process.env.REACT_APP_CONTRACT_ADDRESS, typeof process.env.REACT_APP_CONTRACT_ADDRESS)
                console.log(process.env.REACT_APP_CHAIN_ID, typeof process.env.REACT_APP_CHAIN_ID)
                ContractManager.initiateProvider();

                try {
                    await initialization()
                } catch (error: any) {

                    console.error(error);

                    if (error.message.includes('Bad chain id')) {
                        fireToast('warning', `Switch network to ${getChainIdName(parseInt(process.env.REACT_APP_CHAIN_ID!))}`)

                    } else {
                        fireToast('error', 'Something went wrong during app initialization');
                    }
                }

                window.addEventListener(PROVIDER_EVENT, handleProviderEvents);

                window.addEventListener(CONTRACT_EVENT, handleContractEvents);

                setAppLoading(false);
            }
        })();

        return () => {
            window.removeEventListener(PROVIDER_EVENT, handleProviderEvents);

            window.removeEventListener(CONTRACT_EVENT, handleContractEvents);

            ContractManager.cleanEvents();
        }
    }, []);

    useEffect(() => {
        if (appLoading) return; /* Initialization Guard */

        setAppLoading(true);

        window.location.reload();

    }, [chainId]);

    useEffect(() => {
        if (appLoading) return; /* Initialization Guard */

        (async () => {
            try {
                saveAddressInLocalStorage(address);

                isChainIdCorrect(chainId)
                    ? setIsAdmin(await ContractManager.isCurrentUserOwner(address))
                    : setIsAdmin(false)
                ;

            } catch (error) {
                fireToast('error', 'Something went wrong');
            }
        })();
    }, [address])

    return(
        <>
            <UserContext.Provider value={{isLogged, toggleIsLogged, address, changeAddress, isAdmin, chainId, votingStatus, appLoading}}>
                <Header/>
                <div className="container-fluid mt-3">
                    {!appLoading &&
                        <Routes>
                            <Route path="/" element={<Proposals/>}/>
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
