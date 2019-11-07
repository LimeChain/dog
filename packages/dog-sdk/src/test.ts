import { ethers } from "ethers";
import DOG from "./dog";
import DOGBuilder from "./dog/builder";
import NetworkConstants from "./constants/network-constants";

const run = async () => {

	const network = "goerli";

	const provider = new ethers.providers.InfuraProvider(network, "40c2813049e44ec79cb4d7e0d18de173");
	const deployerWallet = new ethers.Wallet(
		"0x09D63A68DAFA08DFFEE686E044F8DC4FE4FC368011D757EDF68DE4FE8AF89F82",
		provider);
	const builder =
		new DOGBuilder("DOG Token", "DOG")
			.withBuySlopeOf(10)
			.withBank("0xd4Fa489Eacc52BA59438993f37Be9fcC20090E39")
			.withInvestmentTokenAddress(NetworkConstants.getInvestmentTokens(network)[0].value);

	const deployedDog = await builder.deploy(deployerWallet, network);

	console.log(deployedDog);

	const dogInst = await deployedDog.wait();

	// const dogInst = DOG.at("0x14d65cc6831cda49486850480c8ade31994a4504", deployerWallet);

	const dogTokenInstance = await dogInst.getDogToken();
	console.log(dogTokenInstance.address);
	const usdTokenInstance = await dogInst.getInvestmentToken();
	console.log(usdTokenInstance.address);

	const balance1 = await usdTokenInstance.balanceOf(dogInst.address);
	console.log(balance1.toString(10));

	const balance2 = await usdTokenInstance.balanceOf(deployerWallet.address);
	console.log(balance2.toString(10));

	// const price = await dogInst.calcDogForUSD("100000000000000000000000");

	// console.log(price.toString(10));

	console.log("approving");

	const approveTx = await usdTokenInstance.approve(dogInst.address, "2000000000000000000000");
	console.log(approveTx);
	await approveTx.wait();



	console.log("unlocking");

	const unlockTx = await dogInst.unlockOrganisation("1000000000000000000000", "1000000000000000000000");
	console.log(unlockTx);
	await unlockTx.wait();

	console.log("allowance check");
	const balance3 = await usdTokenInstance.allowance(deployerWallet.address, dogInst.address);
	console.log(balance3.toString(10));


	console.log("investing");
	const investTx = await dogInst.invest("1000000000000000000000");
	console.log(investTx);
	await investTx.wait();

	console.log("approving dog");

	const approveTx2 = await dogTokenInstance.approve(dogInst.address, "1000000000000000000000");
	console.log(approveTx2);
	await approveTx2.wait();

	console.log("selling");

	const sellTx = await dogInst.sell("1000000000000000000000");
	console.log(sellTx);
	await sellTx.wait();

	const balance = await dogTokenInstance.balanceOf(deployerWallet.address);
	console.log(balance.toString(10));


};

run();
