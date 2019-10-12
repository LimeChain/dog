import chalk from "chalk";
import { DOGBuilder, NetworkConstants } from "dog-sdk";
import { ethers } from "ethers";

import * as inquirer from "inquirer";
import * as emoji from "node-emoji";
// All emojis - https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json

const onMissing = () => "";

const knowsCO = [
	{
		type: "confirm",
		name: "knows",
		message: "Do you know what Continuous Organisation is?",
		default: true,
	}
];

const networkQuestions = () => {
	const networks = NetworkConstants.getNetworks();
	return [{
		type: "list",
		name: "network",
		message: "What network would you like to use?",
		default: "rinkeby",
		choices: [
			...networks
		]
	}, {
		type: "confirm",
		name: "hasInfuraKey",
		message: "Do you have infura key?",
		default: true
	},
	{
		type: "input",
		name: "infuraKey",
		message: "What is your infura key?",
		when(answers) {
			return answers.hasInfuraKey;
		},
		validate(value) {
			return value.length === 32 || emoji.emojify(`:dog: I do not think this is a valid infura key :book:`, onMissing);
		},
	}];
};

const privateKeyQuestion = () => {
	return [
		{
			type: "password",
			name: "privateKey",
			message: "What is the private key of the wallet you want to deploy from?",
			validate(value: string) {
				return value.length === 64 || (value.length === 66 && value.startsWith("0x")) || emoji.emojify(`:dog: I do not think this is a valid private key :book:`, onMissing);
			},
		}];
};

const dogQuestions = (networkConstants, deployerWallet) => {
	return [
		{
			type: "input",
			name: "tokenName",
			message: "What would be the name of the token of your new organisation?",
			validate(value) {
				return value.length > 3 || emoji.emojify(`:dog: The name of your token is way too short. I have named my token "Dog Token" - try something similar :book:`, onMissing);
			},
		},
		{
			type: "input",
			name: "tokenSymbol",
			message: "What would be the symbol of the token of your new organisation? (At least 2 characters length.)",
			validate(value) {
				return value.length > 2 || emoji.emojify(`:dog: The symbol of your token is way too short. I have named my token "DOG" - try something similar :book:`, onMissing);
			},
		},
		{
			type: "list",
			name: "investmentTokenAddress",
			message: "What token would you like to invest with",
			default: "0x18C05f1c241B57F07104ab00495a3Bbb69C38ece",
			choices: [
				...networkConstants,
				{
					name: "Other",
					value: null
				}
			]
		},
		{
			type: "input",
			name: "investmentTokenAddress",
			message: "What is the contract address of the investment token?",
			when(answers) {
				return answers.investmentTokenAddress == null;
			},
			validate(value) {
				try {
					ethers.utils.getAddress(value);
				} catch (e) {
					return emoji.emojify(
						`:dog: This does not look like a valid address to me. Can you check it again?`, onMissing);
				}
				return true;
			},
		},
		{
			type: "input",
			name: "bankAddress",
			message: "The address that will receive the investment fund",
			default: deployerWallet.address,
			validate(value) {
				try {
					ethers.utils.getAddress(value);
				} catch (e) {
					return emoji.emojify(
						`:dog: This does not look like a valid address to me. Can you check it again?`, onMissing);
				}
				return true;
			},
		},
		{
			type: "input",
			name: "buybackReserve",
			message: "How much do you want to leave in the contract as a reserve?",
			default: 20,
			validate(value) {
				return !isNaN(value) && value > 1 && value < 99;
			},
		},
		{
			type: "list",
			name: "buySlope",
			message: "How granular you want your new token to be?",
			default: "Normal",
			choices: [
				{
					name: "Normal",
					value: 1
				},
				{
					name: "Very (advanced)",
					value: 10
				},
				{
					name: "Tokens everywhere",
					value: 100
				}
			]
		},
		{
			type: "confirm",
			name: "overrideMathContract",
			message: "Do you want to override the bonding mathematics contract? (Advanced feature)",
			default: false
		},
		{
			type: "input",
			name: "bondingMathAddress",
			message: "What is the address of the bonding mathematics contract you want to use?",
			when(answers) {
				return answers.overrideMathContract;
			},
			validate(value) {
				try {
					ethers.utils.getAddress(value);
				} catch (e) {
					return emoji.emojify(
						`:dog: This does not look like a valid address to me. Can you check it again?`, onMissing);
				}
				return true;
			},
		}
	];
};

const run = async () => {
	console.log(
		emoji.emojify(`:dog: Bark! DOG is here to help you to spawn your own brand new Continuous Organisation`, onMissing));
	const knows = (await inquirer.prompt(knowsCO)).knows;
	if (!knows) {
		console.log(emoji.emojify(
			`:dog: Continuous Organisations are types of decentralised autonomous organisations optimised to operate as investment funds :moneybag:.
The organisations are governed on the Ethereum blockchain and the investors in the organisation receive back tokens in exchange for their investment.
The amount ot tokens received per investment gradually declines the more people join the continuous organisation - All governed by mathematical formula :triangular_ruler:.
In addition any investor can sell back their tokens for portion of the current organisation worth.`,
			onMissing));
		return;
	}
	const networkAnswers = await inquirer.prompt(networkQuestions());
	let infuraKey = "40c2813049e44ec79cb4d7e0d18de173";
	if (networkAnswers.hasInfuraKey) {
		infuraKey = networkAnswers.infuraKey;
	}
	const provider = new ethers.providers.InfuraProvider(networkAnswers.network, infuraKey);
	let privateKey = (await inquirer.prompt(privateKeyQuestion())).privateKey;
	if (privateKey.length === 64) {
		privateKey = `0x${privateKey}`;
	}
	const deployerWallet = new ethers.Wallet(privateKey, provider);
	const config = await inquirer.prompt(
		dogQuestions(NetworkConstants.getInvestmentTokens(networkAnswers.network), deployerWallet));

	let builder =
		new DOGBuilder(config.tokenName, config.tokenSymbol)
			.withBank(config.bankAddress)
			.withInvestmentTokenAddress(config.investmentTokenAddress)
			.withBuySlopeOf(config.buySlope);

	if (config.overrideMathContract) {
		builder = builder
			.withBondingMathAddress(config.bondingMathAddress);
	}
	console.log(emoji.emojify(`:dog: :dog2: Starting the deployment process... :`));

	const deploymentInfo = await builder.deploy(deployerWallet);

	console.log(
		emoji.emojify(
			`:dog: :newspaper: The contract will have the address of ${chalk.cyan(deploymentInfo.contractAddress)}`));
	const txHashLink =
		`https://${networkAnswers.network === "mainnet" ? "" : networkAnswers.network}.etherscan.io/tx/${deploymentInfo.transactionHash}`;

	console.log(emoji.emojify(`:dog: :eyes: You can view the deployment transaction at ${chalk.cyan(txHashLink)}`));

	console.log(emoji.emojify(`:dog: :hourglass_flowing_sand: Now we pace around a bit...`));

	await deploymentInfo.wait();

	console.log(
		emoji.emojify(`:dog: :confetti_ball: Your DOG was deployed successfully! :woman-with-bunny-ears-partying:`));

};

export { run };
