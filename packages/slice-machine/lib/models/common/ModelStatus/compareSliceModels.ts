import equal from "fast-deep-equal";
import { Screenshot } from "../Library";
import { SliceSM } from "../Slice";
import { ModelStatus } from ".";

export type FrontEndSliceModel = {
  local: SliceSM;
  remote?: SliceSM;
  localScreenshots: Record<string, Screenshot>;
};

export function compareSliceModels(
  models: Required<FrontEndSliceModel>
): ModelStatus {
  const areScreenshotsEqual = compareScreenshots(
    models.remote,
    models.localScreenshots
  );
  if (!areScreenshotsEqual) {
    return ModelStatus.Modified;
  }
  const areModelsEquals = equal(
    stripImageUrl(models.local),
    stripImageUrl(models.remote)
  );

  if (!areModelsEquals) {
    return ModelStatus.Modified;
  }
  return ModelStatus.Synced;
}

const stripImageUrl = (slice: SliceSM) => ({
  ...slice,
  variations: slice.variations.map((v) => ({ ...v, imageUrl: undefined })),
});

function compareScreenshots(
  remoteModel: SliceSM,
  localScreenshots: Record<string, Screenshot>
) {
  return remoteModel.variations.every((variation) => {
    const localScreenshot = localScreenshots[variation.id];
    if (!variation.imageUrl && !localScreenshot) {
      return true;
    }
    if (variation.imageUrl?.includes(localScreenshot?.hash)) {
      return true;
    }
    return false;
  });
}
