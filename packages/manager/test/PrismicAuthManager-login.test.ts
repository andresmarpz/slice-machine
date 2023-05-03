import { expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { readPrismicAuthState } from "./__testutils__/readPrismicAuthState";

import { createPrismicAuthManager } from "../src";

it("updates the auth state file with the given login info", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	const { profile } = mockPrismicUserAPI(ctx);

	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authState = await readPrismicAuthState();

	expect(authState).toStrictEqual({
		base: "https://prismic.io/",
		cookies: "prismic-auth=token; SESSION=session",
		shortId: profile.shortId,
		intercomHash: profile.intercomHash,
	});
});

it("retains existing cookies in the auth state file", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["foo=bar"],
	});
	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe(
		"foo=bar; prismic-auth=token; SESSION=session",
	);
});

it("when .prismic contains invalid json it should reset the file", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	const { profile } = mockPrismicUserAPI(ctx);

	fs.writeFile(path.join(os.homedir(), ".prismic"), "");

	await prismicAuthManager.login({
		email: "foo@prismic.io",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe("prismic-auth=token; SESSION=session");
	expect(authState?.shortId).toBe(profile.shortId);
	expect(authState?.intercomHash).toBe(profile.intercomHash);
});
