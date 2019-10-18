import { ethers } from "ethers";
import DOG from "./dog";
import DOGBuilder from "./dog/builder";
import NetworkConstants from "./constants/network-constants";

const run = async () => {

	const provider = new ethers.providers.InfuraProvider("ropsten", "40c2813049e44ec79cb4d7e0d18de173");
	const deployerWallet = new ethers.Wallet(
		"0x2030B463177DB2DA82908EF90FA55DDFCEF56E8183CAF60DB464BC398E736E6F",
		provider);
	// const builder =
	// 	new DOGBuilder("DOG Token", "DOG")
	// 		.withBuySlopeOf(10)
	// 		.withBank("0xd4Fa489Eacc52BA59438993f37Be9fcC20090E39")
	// 		.withBondingMathAddress(NetworkConstants.getBondingMathContract("ropsten"))
	// 		.withInvestmentTokenAddress(NetworkConstants.getInvestmentTokens("ropsten")[0].value);

	// const deployedDog = await builder.deploy(deployerWallet);

	// console.log(deployedDog);

	// const dogInst = await deployedDog.wait();

	const dogInst = DOG.at("0xF58359125FCBaBDA45958150Af4670210400896C", deployerWallet);

	const dogTokenInstance = await dogInst.getDogToken();
	console.log(dogTokenInstance.address);
	const usdTokenInstance = await dogInst.getInvestmentToken();
	console.log(usdTokenInstance.address);

	// const balance1 = await usdTokenInstance.balanceOf(dogInst.address);
	// console.log(balance1.toString(10));

	// const price = await dogInst.calcDogForUSD("100000000000000000000000");

	// console.log(price.toString(10));

	const approveTx = await usdTokenInstance.approve(dogInst.address, "100000000000000000000000");
	console.log(approveTx);
	await approveTx.wait();

	const unlockTx = await dogInst.unlockOrganisation("100000000000000000000000", "100000000000000000000000");
	console.log(unlockTx);
	await unlockTx.wait();

	// const investTx = await dogInst.invest("100000000000000000000000");
	// console.log(investTx);
	// await investTx.wait();

	// const approveTx2 = await dogTokenInstance.approve(dogInst.address, "100000000000000000000000");
	// console.log(approveTx2);
	// await approveTx2.wait();

	// const sellTx = await dogInst.sell("100000000000000000000000");
	// console.log(sellTx);
	// await sellTx.wait();

	const balance = await dogTokenInstance.balanceOf(deployerWallet.address);
	console.log(balance.toString(10));


};

run();
