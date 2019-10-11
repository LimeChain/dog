import { ethers } from "ethers";
import DOG from "../dog";

import basicDogArtifacts from "../interfaces/BasicDogOrganisation.json";

class DOGBuilder {

	public tokenName: string;
	public tokenSymbol: string;

	public buySlope = 1;
	public investmentTokenAddress: string; // TODO add DAI address
	public bankAddress: string; // TODO add DAI address
	public contractInterface = basicDogArtifacts.abi;
	public contractBytecode = basicDogArtifacts.bytecode;

	protected bondingMathAddress = "0xD3961a4a674489a4e11501Fb2e728a3C04fF9682";

	constructor(tokenName: string, tokenSymbol: string) {
		this.tokenName = tokenName;
		this.tokenSymbol = tokenSymbol;
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

	public withBondingMathAddress(address: string): DOGBuilder {
		this.bondingMathAddress = ethers.utils.getAddress(address);
		return this;
	}

	public async deploy(wallet: ethers.Wallet): Promise<any> {
		this.validateInput();
		const dogFactory = new ethers.ContractFactory(this.contractInterface, this.contractBytecode, wallet);
		const contract = await dogFactory.deploy(
			this.bondingMathAddress,
			this.buySlope,
			this.investmentTokenAddress,
			this.bankAddress,
			this.tokenName,
			this.tokenSymbol, 18);

		return {
			contractAddress: contract.address,
			transactionHash: contract.deployTransaction.hash,
			async wait() {
				await contract.deployed();
				return new DOG(contract.address, wallet);
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
	}
}

export default DOGBuilder;
