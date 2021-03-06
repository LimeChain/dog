import constants from "./network-constants.json";

interface InvestmentToken {
	name: string;
	value: string;
}

class NetworkConstants {

	public static getNetworks(): string[] {
		return Object.keys(constants);
	}

	public static getNetworkId(network: string): number {
		return constants[network].networkId;
	}

	public static getInvestmentTokens(network: string): InvestmentToken[] {
		return constants[network].investmentTokens;
	}

	public static getRegistryContract(network: string): string {
		if (constants[network] === undefined) {
			throw new Error(`Unsupported network ${network}`);
		}
		return constants[network].organisationRegistry;
	}
}

export default NetworkConstants;
