import { ModalStoreType } from "@src/modules/modal/types";
import { LoadingStoreType } from "@src/modules/loading/types";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { SlicesStoreType } from "@src/modules/slices/types";
import { RouterState } from "connected-next-router/types";

export type SliceMachineStoreType = {
  modal: ModalStoreType;
  loading: LoadingStoreType;
  userContext: UserContextStoreType;
  environment: EnvironmentStoreType;
  availableCustomTypes: AvailableCustomTypesStoreType;
  slices: SlicesStoreType;
  router: RouterState;
};
