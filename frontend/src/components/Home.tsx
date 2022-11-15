import React, {useContext} from "react";
import {UserContext} from "../App";

function Home() {

    const {isAdmin} = useContext(UserContext)

    return (
        <div>
            <h2>Home page</h2>
            <p>Genial !</p>
            <p>Is admin {isAdmin.toString()}</p>
            <div className="container-fluid">
                <button className="btn btn-lg btn-primary">Test</button>
            </div>
        </div>
    )
}

export default Home
