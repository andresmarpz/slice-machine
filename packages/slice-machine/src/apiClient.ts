import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { SimulatorCheckResponse } from "@models/common/Simulator";
import { SliceMachineManagerClient } from "@slicemachine/manager/client";
import {
  type SliceSM,
  Slices,
  type VariationSM,
  Variations,
} from "@lib/models/common/Slice";
import { CustomTypes } from "@lib/models/common/CustomType";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import ServerState from "@models/server/ServerState";
import { CustomScreenshotRequest } from "@lib/models/common/Screenshots";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { PackageChangelog } from "@lib/models/common/versions";

import { managerClient } from "./managerClient";

/** State Routes * */

export const getState = async (): Promise<ServerState> => {
  const rawState = await managerClient.getState();

  // `rawState` from the client contains non-SM-specific models. We need to
  // transform the data to something SM recognizes.
  const state: ServerState = {
    ...rawState,
    libraries: rawState.libraries.map((library) => {
      return {
        ...library,
        components: library.components.map((component) => {
          return {
            ...component,
            model: Slices.toSM(component.model),

            // Replace screnshot Blobs with URLs.
            screenshots: Object.fromEntries(
              Object.entries(component.screenshots).map(
                ([variationID, screenshot]) => {
                  return [
                    variationID,
                    {
                      ...screenshot,
                      url: URL.createObjectURL(screenshot.data),
                    },
                  ];
                },
              ),
            ),
          };
        }),
      };
    }),
    customTypes: rawState.customTypes.map((customTypeModel) => {
      return CustomTypes.toSM(customTypeModel);
    }),
    remoteCustomTypes: rawState.remoteCustomTypes.map(
      (remoteCustomTypeModel) => {
        return CustomTypes.toSM(remoteCustomTypeModel);
      },
    ),
    remoteSlices: rawState.remoteSlices.map((remoteSliceModel) => {
      return Slices.toSM(remoteSliceModel);
    }),
  };

  return state;
};

/** Custom Type Routes * */

export const updateCustomType = async (
  customType: CustomType,
): ReturnType<SliceMachineManagerClient["customTypes"]["updateCustomType"]> => {
  return await managerClient.customTypes.updateCustomType({
    model: customType,
  });
};

/** Slice Routes * */

export const readSlice = async (libraryID: string, sliceID: string) => {
  const { model, errors } = await managerClient.slices.readSlice({
    libraryID,
    sliceID,
  });
  return { slice: model ? Slices.toSM(model) : undefined, errors };
};

export const renameSlice = async (
  slice: SliceSM,
  libName: string,
): ReturnType<SliceMachineManagerClient["slices"]["renameSlice"]> => {
  return await managerClient.slices.renameSlice({
    libraryID: libName,
    model: Slices.fromSM(slice),
  });
};

export const deleteSlice = async (sliceId: string, libName: string) =>
  await managerClient.slices.deleteSlice({
    libraryID: libName,
    sliceID: sliceId,
  });

export const renameSliceVariation = async (
  slice: ComponentUI,
  variation: VariationSM,
) => {
  return await managerClient.slices.renameSliceVariation({
    libraryID: slice.from,
    sliceID: slice.model.id,
    variationID: variation.id,
    model: Variations.fromSM(variation),
  });
};

export const deleteSliceVariation = managerClient.slices.deleteSliceVariation;

export const generateSliceCustomScreenshot = async (
  params: CustomScreenshotRequest,
): Promise<{
  url: string;
  errors: Awaited<
    ReturnType<SliceMachineManagerClient["slices"]["updateSliceScreenshot"]>
  >["errors"];
}> => {
  const { errors } = await managerClient.slices.updateSliceScreenshot({
    libraryID: params.libraryName,
    sliceID: params.sliceId,
    variationID: params.variationId,
    data: params.file,
  });

  return {
    url: URL.createObjectURL(params.file),
    errors,
  };
};

export const updateSlice = async (
  component: ComponentUI,
): Promise<
  Awaited<ReturnType<(typeof managerClient)["slices"]["updateSlice"]>>
> => {
  return await managerClient.slices.updateSlice({
    libraryID: component.from,
    model: Slices.fromSM(component.model),
    mocks: component.mocks,
  });
};

export const pushChanges: SliceMachineManagerClient["prismicRepository"]["pushChanges"] =
  async (payload) => {
    return await managerClient.prismicRepository.pushChanges(payload);
  };

/** Auth Routes * */

export const startAuth = async (): Promise<void> => {
  return await managerClient.user.logout();
};

export const checkAuthStatus = async (): Promise<CheckAuthStatusResponse> => {
  const isLoggedIn = await managerClient.user.checkIsLoggedIn();

  if (isLoggedIn) {
    const profile = await managerClient.user.getProfile();

    return {
      status: "ok",
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    };
  } else {
    return {
      status: "pending",
    };
  }
};

/** Simulator Routes * */

export const checkSimulatorSetup =
  async (): Promise<SimulatorCheckResponse> => {
    const localSliceSimulatorURL =
      await managerClient.simulator.getLocalSliceSimulatorURL();

    return {
      manifest: Boolean(localSliceSimulatorURL) ? "ok" : "ko",
      value: localSliceSimulatorURL,
    };
  };

export const getSimulatorSetupSteps = async (): ReturnType<
  typeof managerClient.simulator.readSliceSimulatorSetupSteps
> => {
  return await managerClient.simulator.readSliceSimulatorSetupSteps();
};

export type SaveSliceMockRequest = {
  libraryID: string;
  sliceID: string;
  mocks: SharedSliceContent[];
};

export type ReadSliceMockRequest = {
  libraryID: string;
  sliceID: string;
};

export const readSliceMocks = async (
  payload: ReadSliceMockRequest,
): ReturnType<SliceMachineManagerClient["slices"]["readSliceMocks"]> => {
  return await managerClient.slices.readSliceMocks({
    libraryID: payload.libraryID,
    sliceID: payload.sliceID,
  });
};

export const saveSliceMock = async (
  payload: SaveSliceMockRequest,
): ReturnType<SliceMachineManagerClient["slices"]["updateSliceMocks"]> => {
  return await managerClient.slices.updateSliceMocks({
    libraryID: payload.libraryID,
    sliceID: payload.sliceID,
    mocks: payload.mocks,
  });
};

export const getChangelog = async (): Promise<PackageChangelog> => {
  const [
    currentVersion,
    latestNonBreakingVersion,
    sliceMachineUpdateAvailable,
    sliceMachineVersionWithKind,
    adapterUpdateAvailable,
    adapterVersions,
    adapterName,
  ] = await Promise.all([
    managerClient.versions.getRunningSliceMachineVersion(),
    managerClient.versions.getLatestNonBreakingSliceMachineVersion(),
    managerClient.versions.checkIsSliceMachineUpdateAvailable(),
    managerClient.versions.getAllStableSliceMachineVersionsWithKind(),
    managerClient.versions.checkIsAdapterUpdateAvailable(),
    managerClient.versions.getAllStableAdapterVersions(),
    managerClient.project.getAdapterName(),
  ]);

  const sliceMachineVersionsWithMetadata = await Promise.all(
    sliceMachineVersionWithKind.map(async (versionWithKind) => {
      const releaseNotes =
        await managerClient.versions.getSliceMachineReleaseNotesForVersion({
          version: versionWithKind.version,
        });

      return {
        versionNumber: versionWithKind.version,
        releaseNote: releaseNotes ?? null,
        kind: versionWithKind.kind,
      };
    }),
  );

  return {
    sliceMachine: {
      currentVersion,
      latestNonBreakingVersion: latestNonBreakingVersion ?? null,
      updateAvailable: sliceMachineUpdateAvailable,
      versions: sliceMachineVersionsWithMetadata,
    },
    adapter: {
      name: adapterName,
      updateAvailable: adapterUpdateAvailable,
      versions: adapterVersions,
    },
  };
};

export const telemetry = {
  group: managerClient.telemetry.group,
  track: managerClient.telemetry.track,
};
