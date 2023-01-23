import type * as Models from "@core/models";
import { SliceMockConfig } from "./MockConfig";

export interface SliceBody {
  sliceName: string;
  from: string;
}

export interface SliceSaveBody extends SliceBody {
  model: Models.SliceSM;
  mockConfig?: SliceMockConfig;
}

export interface SliceCreateResponse {
  variationId: string;
}
