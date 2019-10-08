const etherlime = require('etherlime-lib');

const DogToken = require('./../build/DogToken');
const BondingMath = require('./../build/BondingMathematics');
const BasicDogOrganisation = require('./../build/BasicDogOrganisation');
const BondingCurveCalculations = require('./../build/BondingCurveCalculations.json');


const deploy = async (network, secret, etherscanApiKey) => {

	const deployer = new etherlime.EtherlimeGanacheDeployer();

	const dogUSD = await deployer.deploy(DogToken, {}, "Dog Token", "DUSD", 18);
	const mintTx = await dogUSD.mint(deployer.signer.address, "100000000000000000000");
	await dogUSD.verboseWaitForTransaction(mintTx, "Minting tokens")

	const bondingCurveCalculator = await deployer.deploy(BondingCurveCalculations, {});

	const bondingMathContractDeployed = await deployer.deploy(BondingMath, {}, bondingCurveCalculator.contractAddress);

	// Deploy Organization
	const dog = await deployer.deploy(BasicDogOrganisation, {},
		bondingMathContractDeployed.contractAddress,
		1,
		dogUSD.contractAddress,
		deployer.signer.address,
		"DOG Token",
		"DOG",
		18
	);

	const approveTx = await dogUSD.approve(dog.contractAddress, "15000000000000000000");
	await dogUSD.verboseWaitForTransaction(approveTx, "Approving unlock and invest tokens");

	const unlockTx = await dog.unlockOrganisation("5000000000000000000", "10000000000000000000");
	await dog.verboseWaitForTransaction(unlockTx, "Unlocking the organisation");

	const investTx = await dog.invest("10000000000000000000");
	await dog.verboseWaitForTransaction(investTx, "Investing in the organisation");

};

module.exports = {
	deploy
};