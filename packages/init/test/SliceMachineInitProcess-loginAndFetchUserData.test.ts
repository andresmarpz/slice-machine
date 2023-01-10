import { beforeEach, expect, it, TestContext, vi } from "vitest";
import { stdin as mockStdin } from "mock-stdin";
import open from "open";
import fetch from "node-fetch";

import { PrismicRepository, PrismicUserProfile } from "@slicemachine/manager";

import { createSliceMachineInitProcess } from "../src";

import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import {
	createPrismicAuthLoginResponse,
	PrismicAuthLoginResponse,
} from "./__testutils__/createPrismicAuthLoginResponse";
import { watchStd } from "./__testutils__/watchStd";
import { spyManager } from "./__testutils__/spyManager";
import { loginUser } from "./__testutils__/loginUser";

const initProcess = createSliceMachineInitProcess();
const spiedManager = spyManager(initProcess);

vi.mock("open", () => {
	return {
		default: vi.fn(),
	};
});

beforeEach(async () => {
	// @ts-expect-error - Accessing protected property
	await initProcess.manager.telemetry.initTelemetry();
});

const loginAndFetchUserDataWithStdin = async (
	prismicAuthLoginResponse: PrismicAuthLoginResponse,
) => {
	const stdin = mockStdin();

	// @ts-expect-error - Accessing protected method
	const promise = initProcess.loginAndFetchUserData();

	await new Promise((res) => setTimeout(res, 50));

	stdin.send("o").restore();

	await new Promise((res) => setTimeout(res, 50));

	const port: number =
		// @ts-expect-error - Mocked instance
		spiedManager.user.getLoginSessionInfo.results[0][1].port;

	await fetch(`http://127.0.0.1:${port}`, {
		method: "post",
		body: JSON.stringify(prismicAuthLoginResponse),
	});

	return promise;
};

const mockPrismicAPIs = (
	ctx: TestContext,
	repositories: PrismicRepository[] = [],
): {
	prismicAuthLoginResponse: PrismicAuthLoginResponse;
	userProfile: PrismicUserProfile;
} => {
	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	const { profile } = mockPrismicUserAPI(ctx, {
		repositoriesEndpoint: {
			expectedAuthenticationToken: prismicAuthLoginResponse._token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			repositories,
		},
	});
	mockPrismicAuthAPI(ctx);

	return {
		prismicAuthLoginResponse,
		userProfile: profile,
	};
};

it("logs in user if logged out", async (ctx) => {
	const { prismicAuthLoginResponse } = mockPrismicAPIs(ctx);

	const { stdout } = await watchStd(() => {
		return loginAndFetchUserDataWithStdin(prismicAuthLoginResponse);
	});

	expect(spiedManager.user.getLoginSessionInfo).toHaveBeenCalledOnce();
	expect(spiedManager.user.nodeLoginSession).toHaveBeenCalledOnce();
	expect(open).toHaveBeenCalledOnce();
	expect(open).toHaveBeenNthCalledWith(
		1,
		// @ts-expect-error - Mocked instance
		spiedManager.user.getLoginSessionInfo.results[0][1].url,
	);
	expect(stdout.join("\n")).toMatch(/Logged in/);
});

it("uses existing session if already logged in", async (ctx) => {
	const { prismicAuthLoginResponse } = mockPrismicAPIs(ctx);
	await loginUser(initProcess, prismicAuthLoginResponse);

	const { stdout } = await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		return initProcess.loginAndFetchUserData();
	});

	expect(spiedManager.user.nodeLoginSession).not.toHaveBeenCalled();
	expect(stdout.join("\n")).toMatch(/Logged in/);
});

it("fetches user profile", async (ctx) => {
	const { userProfile, prismicAuthLoginResponse } = mockPrismicAPIs(ctx);

	await watchStd(() => {
		return loginAndFetchUserDataWithStdin(prismicAuthLoginResponse);
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.userProfile).toStrictEqual(userProfile);
});

it("identifies user", async (ctx) => {
	const { userProfile, prismicAuthLoginResponse } = mockPrismicAPIs(ctx);

	await watchStd(() => {
		return loginAndFetchUserDataWithStdin(prismicAuthLoginResponse);
	});

	expect(spiedManager.telemetry.identify).toHaveBeenCalledOnce();
	expect(spiedManager.telemetry.identify).toHaveBeenNthCalledWith(1, {
		userID: userProfile.shortId,
		intercomHash: userProfile.intercomHash,
	});
	expect(spiedManager.telemetry.track).toHaveBeenCalledOnce();
	expect(spiedManager.telemetry.track).toHaveBeenNthCalledWith(
		1,
		expect.objectContaining({
			event: "command:init:identify",
		}),
	);
});

it("fetches repositories", async (ctx) => {
	const repositories: PrismicRepository[] = [
		{
			domain: "wroom",
			name: "Wroom",
			role: "Administrator",
		},
	];

	const { prismicAuthLoginResponse } = mockPrismicAPIs(ctx, repositories);

	await watchStd(() => {
		return loginAndFetchUserDataWithStdin(prismicAuthLoginResponse);
	});

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.userRepositories).toStrictEqual(repositories);
});
