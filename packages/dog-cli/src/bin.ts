#!/usr/bin/env node

import * as program from "commander";
import * as create from "./create";

program
	.description("This program helps you create and interact with your DOG organisations");

program
	.command("create")
	.description("Runs an interactive wizard helping you to create a DOG organisation")
	.alias("c")
	.action(async () => {

		await create.run();
	});

program.on("command:*", () => {
	console.error("Invalid command: %s\nSee --help for a list of available commands.", program.args.join(" "));
	process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
