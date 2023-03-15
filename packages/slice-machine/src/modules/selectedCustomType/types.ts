import { CustomTypeMockConfig } from "@models/common/MockConfig";
import { CustomTypeSM, TabField } from "@lib/models/common/CustomType";

export type PoolOfFields = ReadonlyArray<{ key: string; value: TabField }>;

export type SelectedCustomTypeStoreType = {
  model: CustomTypeSM;
  initialModel: CustomTypeSM;
  remoteModel: CustomTypeSM | undefined;
  mockConfig: CustomTypeMockConfig;
  initialMockConfig: CustomTypeMockConfig;
} | null;
