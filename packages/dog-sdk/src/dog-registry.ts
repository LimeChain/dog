
import { ethers } from "ethers";

import dogRegistryArtifacts from "./interfaces/BasicDogRegistry.json";
import IERC20Artifacts from "./interfaces/IERC20.json";
import NetworkConstants from "./constants/network-constants";
import DOG from "./dog.js";

export interface DOGMetadata {
	address: string;
	tokenName: string;
}

export class DOGRegistry {
	[x: string]: any;

	public static async for(provider: ethers.providers.Provider): Promise<DOGRegistry> {
		const network = await provider.getNetwork();
		return new this(NetworkConstants.getRegistryContract(network.name), provider);
	}

	protected contractInterface = dogRegistryArtifacts.abi;

	private contract: ethers.Contract;

	constructor(address: string, provider: ethers.providers.Provider) {
		this._address = address;
		this._provider = provider;
		this.contract = new ethers.Contract(address, this.contractInterface, provider);
		ethers.utils.defineReadOnly(this, "functions", this.contract.functions);
		Object.keys(this.contract.functions).forEach((name) => {
			if (this[name] == null) {
				ethers.utils.defineReadOnly(this, name, this.contract.functions[name]);
			} else {
				console.warn(`WARNING: Multiple definitions for ${name}`);
			}
		});

	}

	public async getAllOrganisations(signer: ethers.Signer): Promise<DOG[]> {
		const dogsCount = await this.contract.organisationsCount();
		const dogs = new Array<DOG>();
		for (let i = dogsCount - 1; i >= 0; i--) {
			const dogAddress = await this.contract.organisations(i);
			dogs.push(DOG.at(dogAddress, signer));
		}
		return dogs;
	}

	public async getAllOrganisationsMetadata(): Promise<DOGMetadata[]> {
		const dogsCount = await this.contract.organisationsCount();
		const dogs = new Array<DOGMetadata>();
		for (let i = dogsCount - 1; i >= 0; i--) {
			const dogAddress = await this.contract.organisations(i);
			const dogTokenName = await this.contract.nameOf(dogAddress);
			dogs.push({
				address: dogAddress,
				tokenName: dogTokenName
			});
		}
		return dogs;
	}

}