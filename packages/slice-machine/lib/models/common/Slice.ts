import type Models from "@slicemachine/core/build/models";
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

export type DeleteSliceResponse =
  | { err: unknown; reason: string; status: number; type: "error" | "warning" }
  | Record<string, never>;
