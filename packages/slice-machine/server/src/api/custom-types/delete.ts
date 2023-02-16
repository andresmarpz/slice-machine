import {
  CustomTypesPaths,
  GeneratedCustomTypesPaths,
  MocksConfig,
} from "../../../../lib/models/paths";
import * as IO from "../../../../lib/io";
import { RequestWithEnv } from "../http/common";
import {
  DeleteCustomTypeQuery,
  DeleteCustomTypeResponse,
} from "../../../../lib/models/common/CustomType";
import { remove as removeCtsFromMockConfig } from "../../../../lib/mock/misc/fs";
import path, { resolve } from "path";

export default async function handler(
  req: RequestWithEnv
): Promise<DeleteCustomTypeResponse> {
  const { id } = req.query as DeleteCustomTypeQuery;
  const ctFolder = CustomTypesPaths(req.env.cwd).customType(id).folder();
  const customTypeAssetsFolder = GeneratedCustomTypesPaths(req.env.cwd)
    .customType(id)
    .folder();

  try {
    IO.CustomType.deleteCustomType(ctFolder);
  } catch (err) {
    console.error(`[custom-type/delete] ${err as string}`);
    return {
      err: err,
      reason: "We couldn't delete your custom type. Check your terminal.",
      status: 500,
      type: "error",
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const deleteAssets = async () => {
    try {
      IO.CustomType.deleteCustomType(customTypeAssetsFolder);
    } catch (err) {
      console.error(
        `[custom-type/delete] Could not delete your custom type assets files.\n`,
        `To resolve this, manually delete the directory ${resolve(
          customTypeAssetsFolder
        )}`
      );
      throw err;
    }
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const updateMockConfig = async () => {
    try {
      removeCtsFromMockConfig(req.env.cwd, { key: id, prefix: "_cts" });
    } catch (err) {
      console.error(
        `[custom-type/delete] Could not delete your custom type from the mock-config.json.\n`,
        `To resolve this, manually remove the ${id} field in ${resolve(
          MocksConfig(req.env.cwd)
        )}`
      );
      throw err;
    }
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const updatedTypes = async () => {
    try {
      IO.Types.upsert(req.env);
    } catch (err) {
      console.error(
        `[custom-type/delete] Could not update the project types.\n`,
        `You can manually delete these in ${resolve(
          path.join(req.env.cwd, ".slicemachine", "prismicio.d.ts")
        )}`
      );
      throw err;
    }
  };

  const settledResults = await Promise.allSettled([
    deleteAssets(),
    updateMockConfig(),
    updatedTypes(),
  ]);

  return settledResults.some((res) => res.status === "rejected")
    ? {
        err: {},
        reason:
          "Something went wrong when deleting your Custom Type. Check your terminal.",
        status: 500,
        type: "warning",
      }
    : {};
}
