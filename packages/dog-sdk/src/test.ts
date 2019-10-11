import { ethers } from "ethers";
import DOG from "./dog";
import DOGBuilder from "./dog/builder";

const run = async () => {

	const builder =
		new DOGBuilder("DOG Token", "DOG")
			.withBuySlopeOf(10)
			.withBank("0xd4Fa489Eacc52BA59438993f37Be9fcC20090E39")
			.withInvestmentTokenAddress("0x18C05f1c241B57F07104ab00495a3Bbb69C38ece")
			.withBondingMathAddress("0x52D8F59cf335f3255C9E89f142bb853A533c8dc6");

	const provider = new ethers.providers.InfuraProvider("rinkeby", "40c2813049e44ec79cb4d7e0d18de173");
	const deployerWallet = new ethers.Wallet(
		"0x2030B463177DB2DA82908EF90FA55DDFCEF56E8183CAF60DB464BC398E736E6F",
		provider);
	// const deployedDog = await builder.deploy(deployerWallet);

	const dogInst = DOG.at("0xc13bebddd97814465aAB55Db5D91932a85c8b650", deployerWallet);
	const price = await dogInst.calcDogForUSD("10000000000");

	console.log(price.toString(10));

};

run();
