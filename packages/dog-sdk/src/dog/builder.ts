import { ethers, Event as EthersEvent } from "ethers";
import DOG from "../dog";

import NetworkConstants from "../constants/network-constants.json";
import dogRegistryArtifact from "../interfaces/BasicDogRegistry.json";

class DOGBuilder {

	public tokenName: string;
	public tokenSymbol: string;

	public buySlope = 1;
	public buybackReservePercent = 20;
	public investmentTokenAddress: string;
	public bankAddress: string;
	public registryInterface = dogRegistryArtifact.abi;

	protected bondingMathAddress;

	constructor(tokenName: string, tokenSymbol: string) {
		this.tokenName = tokenName;
		this.tokenSymbol = tokenSymbol;
	}

	public withReservePercent(buybackReservePercent: number): DOGBuilder {
		this.buybackReservePercent = buybackReservePercent;
		return this;
	}

	public withBuySlopeOf(buySlope: number): DOGBuilder {
		this.buySlope = buySlope;
		return this;
	}

	public withInvestmentTokenAddress(address: string): DOGBuilder {
		this.investmentTokenAddress = ethers.utils.getAddress(address);
		return this;
	}

	public withBank(address: string): DOGBuilder {
		this.bankAddress = ethers.utils.getAddress(address);
		return this;
	}

	public async deploy(signer: ethers.Signer, network: string): Promise<any> {
		const networkConstants = NetworkConstants[network];
		if (networkConstants === undefined) {
			throw new Error("Unknown or unsupported network!");
		}
		this.validateInput();
		const registryAddress = networkConstants.organisationRegistry;
		const dogRegistry = new ethers.Contract(registryAddress, this.registryInterface, signer);
		const createTx = await dogRegistry.createNewOrganisation(
			this.buybackReservePercent,
			this.buySlope,
			this.investmentTokenAddress,
			this.bankAddress,
			this.tokenName,
			this.tokenSymbol, 18);

		return {
			transactionHash: createTx.hash,
			async wait() {
				const deployedTransaction = await createTx.wait();
				const deployEvent = deployedTransaction.events.filter((event: any) => event.event === "OrganisationCreated");
				const deployEventArgs = deployEvent[0].args;
				return new DOG(deployEventArgs.organisationAddress, signer);
			},
		};

	}

	private validateInput() {
		if (this.tokenName == null || this.tokenName.length === 0) {
			throw new Error("The token name is not defined or too short");
		}

		if (this.tokenSymbol == null || this.tokenSymbol.length < 2) {
			throw new Error("The token symbol is not defined or too short");
		}

		if (this.investmentTokenAddress == null) {
			throw new Error("The investment token address is not defined");
		}

		if (this.bankAddress == null) {
			throw new Error("Bank address is not defined");
		}

		if (this.buySlope < 1) {
			throw new Error("Buy slope incorrect");
		}

		if (this.buybackReservePercent < 1 || this.buybackReservePercent > 99) {
			throw new Error("Buy Back Reserve percent incorrect");
		}
	}
}

export default DOGBuilder;
