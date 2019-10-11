import constants from "./network-constants.json";

interface InvestmentToken {
	name: string;
	value: string;
}

class NetworkConstants {

	public static getNetworks(): string[] {
		return Object.keys(constants);
	}

	public static getInvestmentTokens(network: string): InvestmentToken[] {
		return constants[network].investmentTokens;
	}
}

export default NetworkConstants;
