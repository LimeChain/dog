#!/usr/bin / env node

import * as program from "commander";
import * as create from "./create";

program
	.description("This program helps you interact with your DOG organisations");

program
	.command("create")
	.description("Runs an interactive wizard helping you to create a DOG organisation")
	.alias("c")
	.action(async () => {

		await create.run();
	});

program.parse(process.argv);
