import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "../App";

function AdminPanel() {
    // Recup statut du contrat
    // Conditionner affichage et fonctionnement des features selon
    // Changement statut :
    // - Créer mapping chronologie des actions
    // - Griser les invalides

    const [isLoading, setIsLoading] = useState(true);

    const {isAdmin, votingStatus, changeVotingStatus} = useContext(UserContext);

    useEffect(() => {
        if (!isAdmin) {
            window.location.href = '/not-found';
            return;
        }

        setIsLoading(false);
    }, []);


    return (
        isLoading
            ? <div></div>
            :
                <div>
                    <h2>Admin panel</h2>
                </div>

    )
}

export default AdminPanel;
