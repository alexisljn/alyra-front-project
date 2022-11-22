# Projet Alyra #3

## Application frontend

## Liens
- https://alyra-front-project.vercel.app/
- Video : https://www.youtube.com/watch?v=d_BRReILxeg

### Prérequis

- Docker
- Make

### Commandes

#### Lancer le projet
`docker compose up`

#### Lancer les tests
`make test`

#### Inspecter le coverage
`make coverage`

#### Déployer le contrat
`make run` *Puis suivre instructions* 

### Instructions

`frontend/.env.development` doit être complété en suivant `frontend/.env.default`.

Pour fonctionner en local, la variable `REACT_APP_CHAIN_ID` doit être égal à `31337`
(Ceci demandant peut être une modification dans les paramètres localhost de metamask).

L'adresse du contrat sert de valeur à `REACT_APP_CONTRACT_ADDRESS`.

Lors d'un changement de valeur, le container react doit être redémarré (`docker compose stop react` puis `docker compose start react`)
pour que les modifications soient prises en compte.
