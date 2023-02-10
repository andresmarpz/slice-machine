import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import * as Libraries from "@slicemachine/core/build/libraries";
import {
  CustomPaths,
  GeneratedPaths,
} from "@slicemachine/core/build/node-utils/paths";
import * as IO from "../../../../lib/io";
import { remove as removeSliceFromMockConfig } from "../../../../lib/mock/misc/fs";
import path from "path";

import generateLibIndexFile from "../common/generateLibIndexFile";
import { MocksConfig } from "../../../../lib/models/paths";
import { DeleteSliceResponse } from "../../../../lib/models/common/Slice";
import { removeSliceFromCustomTypes } from "../../../../lib/io/Slice";

interface DeleteSliceBody {
  sliceId: string;
  libName: string;
}

const TROUBLESHOOTING_DOCS_LINK = "https://prismic.io/docs/help-center";

export async function deleteSlice(req: {
  body: DeleteSliceBody;
  env: BackendEnvironment;
}): Promise<DeleteSliceResponse> {
  const { env } = req;
  const { sliceId, libName } = req.body;

  if (!env.manifest.libraries) {
    const message = `When deleting slice: ${sliceId}, there were no libraries configured in your SM.json.`;
    console.error(`[slice/delete] ${message}`);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
      type: "error",
    };
  }
  const libraries = Libraries.libraries(env.cwd, env.manifest.libraries);
  const targetLibrary = libraries.find((library) => library.name === libName);
  if (!targetLibrary) {
    const message = `When deleting slice: ${sliceId}, the library: ${libName} was not found.`;
    console.error(`[slice/delete] ${message}`);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
      type: "error",
    };
  }
  const targetSlice = targetLibrary.components.find(
    (component) => component.model.id === sliceId
  );

  if (!targetSlice) {
    const message = `When deleting slice: ${sliceId}, the slice: ${sliceId} was not found.`;
    console.error(`[slice/delete] ${message}`);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
      type: "error",
    };
  }

  const sliceDirectory = CustomPaths(env.cwd)
    .library(libName)
    .slice(targetSlice.model.name);

  const generatedSliceDirectory = GeneratedPaths(env.cwd)
    .library(libName)
    .slice(targetSlice.model.name);

  try {
    IO.Slice.deleteSlice(sliceDirectory.value());
  } catch (err) {
    console.error(
      `[slice/delete] Could not delete your slice files. Check our troubleshooting guide here: ${TROUBLESHOOTING_DOCS_LINK}`
    );
    console.error(err);
    return {
      err: err,
      reason: "We couldn't delete your slice. Check your terminal.",
      status: 500,
      type: "error",
    };
  }

  const deleteAssets = async () => {
    try {
      IO.Slice.deleteSlice(generatedSliceDirectory.value());
    } catch (err) {
      console.error(
        `[slice/delete] Could not delete your slice assets files. Check our troubleshooting guide here: ${TROUBLESHOOTING_DOCS_LINK}`
      );
      throw err;
    }
  };

  const updateMockConfig = async () => {
    try {
      removeSliceFromMockConfig(req.env.cwd, {
        key: targetSlice.model.name,
        prefix: libName,
      });
    } catch (err) {
      console.error(
        `[slice/delete] Could not delete your slice from the mock-config.json in ${MocksConfig(
          req.env.cwd
        )}. Check our troubleshooting guide here: ${TROUBLESHOOTING_DOCS_LINK}`
      );
      throw err;
    }
  };

  const updateCustomTypes = async () => {
    try {
      removeSliceFromCustomTypes(sliceId, env.cwd);
    } catch (err) {
      console.error(
        `[slice/delete] Could not update the custom types using your slice. Check our troubleshooting guide here: ${TROUBLESHOOTING_DOCS_LINK}`
      );
      throw err;
    }
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const updateTypes = async () => {
    try {
      IO.Types.upsert(env);
    } catch (err) {
      console.error(
        `[slice/delete] Could not update the project types in ${path.join(
          env.cwd,
          ".slicemachine",
          "prismicio.d.ts"
        )}. Check our troubleshooting guide here: ${TROUBLESHOOTING_DOCS_LINK}`
      );
      throw err;
    }
  };

  const updateLibraryIndexFile = () => {
    try {
      generateLibIndexFile(targetLibrary, env.cwd, env.framework);
    } catch (err) {
      console.error(
        `[slice/delete] Could not update the slice library's index.js file. Check our troubleshooting guide here: ${TROUBLESHOOTING_DOCS_LINK}`
      );
      throw err;
    }
  };

  const settledResults = await Promise.allSettled([
    deleteAssets(),
    updateMockConfig(),
    updateCustomTypes(),
    updateTypes(),
    updateLibraryIndexFile(),
  ]);

  return settledResults.some((res) => res.status === "rejected")
    ? {
        err: {},
        reason:
          "Something went wrong when deleting your slice. Check your terminal.",
        status: 500,
        type: "warning",
      }
    : {};
}
