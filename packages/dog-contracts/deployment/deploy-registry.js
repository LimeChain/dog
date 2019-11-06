const etherlime = require('etherlime-lib');

const BasicDogRegistry = require('./../build/BasicDogRegistry');
const BondingMath = require('./../build/BondingMathematics');
const BondingCurveCalculations = require('./../build/BondingCurveCalculations.json');


const deploy = async (network, secret, etherscanApiKey) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, "40c2813049e44ec79cb4d7e0d18de173", {
		gasLimit: 4020514,
		etherscanApiKey
	})

	const bondingCurveCalculator = await deployer.deploy(BondingCurveCalculations, {});

	const bondingMathContractDeployed = await deployer.deploy(BondingMath, {}, bondingCurveCalculator.contractAddress);

	// Deploy Organization
	const dog = await deployer.deployAndVerify(BasicDogRegistry, {},
		bondingMathContractDeployed.contractAddress
	);

};

module.exports = {
	deploy
};