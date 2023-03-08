import { expect, it } from "vitest";
import * as fs from "node:fs/promises";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the project's Slice Machine config", async () => {
	const adapter = createTestPlugin();
	const testSliceMachineConfig = {
		repositoryName: "bar",
		apiEndpoint: "baz",
		adapter,
		libraries: ["./qux"],
		localSliceSimulatorURL: "quux",
		plugins: ["corge"],
	};
	const cwd = await createTestProject(testSliceMachineConfig);
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const sliceMachineConfig = await manager.project.loadSliceMachineConfig();

	expect(sliceMachineConfig).toStrictEqual({
		...testSliceMachineConfig,
		adapter: adapter.meta.name,
	});
});

it("does not cache the config, loading the most up-to-date version", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	// Load the config once before we check it again. This value will be
	// used to verify the config is not cached.
	const sliceMachineConfig = await manager.project.loadSliceMachineConfig();

	// Update something in the config so we can check if
	// `loadSliceMachineConfig()` returns the most up-to-date version.
	const sliceMachineConfigPath =
		await manager.project.getSliceMachineConfigPath();
	const newRepositoryName = "changed";
	await fs.writeFile(
		sliceMachineConfigPath,
		JSON.stringify({
			...sliceMachineConfig,
			repositoryName: newRepositoryName,
		}),
	);

	const reloadedSliceMachineConfig =
		await manager.project.loadSliceMachineConfig();

	expect(reloadedSliceMachineConfig.repositoryName).toBe(newRepositoryName);
});
