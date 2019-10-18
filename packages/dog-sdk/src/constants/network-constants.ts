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

	public static getBondingMathContract(network: string): string {
		return constants[network].bondingCurveContractAddress;
	}
}

export default NetworkConstants;
