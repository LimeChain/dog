# `dog-sdk`

> TODO: description

## Usage

### Installation

```
npm i dog-sdk

or

yarn add dog-sdk

```

### Including DOG-SDK

```
const dogSdk = require('dog-sdk');

or

import { DOG, DOGBuilder, NetworkConstants } from "dog-sdk";

or

import * as dog from 'dog-sdk'

```

### Building a DOG

```
const network = "rinkeby"; /* Or any other network */
const provider = new ethers.providers.InfuraProvider(network, infuraKey);
const deployerWallet = new ethers.Wallet(privateKey, provider);
let builder =
	new DOGBuilder("Dog Token", "DOG")
		.withBank("0xd4Fa489Eacc52BA59438993f37Be9fcC20090E39")
		.withInvestmentTokenAddress(NetworkConstants[network].investmentTokens.DAI)
		.withBuySlopeOf(1);

const deploymentInfo = await builder.deploy(deployerWallet);

// deploymentInfo = {
//	contractAddress: "0xabcd...",
//	transactionHash: "0xtx",
//	wait: async function() {...}
//}

const dog = await deploymentInfo.wait();

// Continue using DOG
```

### Using DOG

```
const dogAddress = "0xabcd...";
const investmentAmount = 100000;
const dog = DOG.at(dogAddress)

const dogTokenContract = await dog.getToken();
const approveTx = dogTokenContract.approve(dogAddress, investmentAmount);
await approveTx.wait();

const investTx = dog.invest(investmentAmount);
await investTx.wait();

```

### Builder API
### DOG API