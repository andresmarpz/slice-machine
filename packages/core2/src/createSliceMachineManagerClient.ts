import { createRPCClient, ExtractProcedures, RPCClient } from "./rpc";

// !!! Never import anything other than types from
// !!! `./createSliceMachineManagerServer` in this file.
import type { SliceMachineManagerServer } from "./createSliceMachineManagerServer";

export type SliceMachineManagerClient = RPCClient<
	ExtractProcedures<SliceMachineManagerServer>
>;

export type CreateSliceMachineManagerClient = {
	port: number;
};

export const createSliceMachineManagerClient = (
	args: CreateSliceMachineManagerClient,
): SliceMachineManagerClient => {
	return createRPCClient({
		serverURL: `http://localhost:${args.port}`,
	});
};
