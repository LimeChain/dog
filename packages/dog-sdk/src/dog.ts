
import { ethers } from "ethers";

import dogOrganisationArtifacts from "./interfaces/IDogOrganisation.json";

class DOG {

	public static at(address: string, wallet: ethers.Wallet): DOG {
		return new this(address, wallet);
	}

	protected contractInterface = dogOrganisationArtifacts.abi;

	private contract: ethers.Contract;
	private _address: string;
	private _providerOrSigner: ethers.Signer | ethers.providers.Provider;

	constructor(address: string, providerOrSigner: ethers.Signer | ethers.providers.Provider) {
		this._address = address;
		this._providerOrSigner = providerOrSigner;
		this.contract = new ethers.Contract(address, this.contractInterface, providerOrSigner);
		ethers.utils.defineReadOnly(this, "functions", this.contract.functions);
		Object.keys(this.contract.functions).forEach((name) => {
			if (this[name] == null) {
				ethers.utils.defineReadOnly(this, name, this.contract.functions[name]);
			} else {
				console.warn(`WARNING: Multiple definitions for ${name}`);
			}
		});
	}

	public get address(): string {
		return this._address;
	}

	public get providerOrSigner(): ethers.Signer | ethers.providers.Provider {
		return this._providerOrSigner;
	}
}

export default DOG;
