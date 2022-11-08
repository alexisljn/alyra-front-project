import React from 'react';
import './App.css';

interface UserContext {
    provider: providers.Web3Provider | null
    isLogged: boolean
    address: string
    toggleIsLogged: () => void,
    changeAddress: (address: string) => void,
}

const UserContext = createContext<UserContext>({
    provider: null,
    isLogged: false,
    address: '',
    toggleIsLogged: () => {},
    changeAddress: () => {}
});

function App() {
  return (
    <>
      <div>
        Header
      </div>
      <div className="container-fluid">
        <button className="btn btn-lg btn-primary">Test</button>
      </div>
    </>
  );
}

export {App, UserContext};
