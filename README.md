# BlockCast

Decentralized one-wallet-one-vote governance ballot built with Solidity, Hardhat, React, Vite, Ethers.js, Tailwind CSS, and Framer Motion.

## Initialize and run

```bash
npm install
npm run compile
npm run node
```

In a second terminal, deploy the local contract:

```bash
npm run deploy:local
```

Copy the printed address into `.env.local` as `VITE_CONTRACT_ADDRESS`, then start the app:

```bash
cp .env.example .env.local
npm run dev
```

Import a Hardhat account into MetaMask and use the localhost network (`http://127.0.0.1:8545`, chain ID `31337`) to cast a vote. Candidate defaults live in `scripts/deploy.js`.

## GitHub Pages

The Vite base is configured for the `BlockCast` repository. Set `VITE_CONTRACT_ADDRESS` in the deployment environment, then run:

```bash
npm run deploy
```

This builds `dist` and publishes it to the `gh-pages` branch.

## Project map

- `contracts/BlockCast.sol`: candidate registry, vote guard, tally, and event.
- `scripts/deploy.js`: mock local deployment with four candidates.
- `src/App.jsx`: wallet connection and interactive ballot.
- `src/styles.css`: Tailwind layers and the visual system.