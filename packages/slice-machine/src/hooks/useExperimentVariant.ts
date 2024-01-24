import { useRequest } from "@prismicio/editor-support/Suspense";

import { Variant } from "@slicemachine/manager";
import { managerClient } from "@src/managerClient";

async function getExperimentVariant(variantName: string) {
  try {
    return await managerClient.telemetry.getExperimentVariant(variantName);
  } catch (e) {
    console.error("Error while trying to get experiment value", e);
    return undefined;
  }
}

export function useExperimentVariant(variantName: string): Variant | undefined {
  return useRequest(getExperimentVariant, [variantName]);
}
