import jsonModel from "./__mockData__/model.json";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import MockSlice from "@lib/mock/Slice";
import { Slices } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { dummyServerState } from "../__mocks__/serverState";
import { LibraryUI } from "@lib/models/common/LibraryUI";

export const getSelectedSliceDummyData = () => {
  const dummyModel = Slices.toSM(jsonModel as unknown as SharedSlice);

  const dummyModelVariationID = "default-slice";

  const dummyMockConfig = {
    [dummyModelVariationID]: {
      primary: {
        section_title: {
          content: "Content",
        },
      },
    },
  };

  const dummySliceState: ComponentUI = {
    from: "slices/libName",
    href: "slices--libName",
    pathToSlice: "./slices/libName",
    fileName: "index",
    extension: "js",
    model: dummyModel,
    screenshots: {},
    mock: MockSlice(Slices.fromSM(dummyModel), dummyMockConfig),
    mockConfig: dummyMockConfig,
  };

  return {
    dummyModel,
    dummyModelVariationID,
    dummyMockConfig,
    dummySliceState,
  };
};

export const getRefreshStateCreatorPayloadData = (
  libraryName: string,
  modelId: string
) => {
  const MOCK_UPDATED_LIBRARY: LibraryUI[] = [
    {
      path: "../../e2e-projects/next/slices/ecommerce",
      isLocal: true,
      name: libraryName,
      components: [
        {
          from: "slices/ecommerce",
          href: "slices--ecommerce",
          pathToSlice: "./slices/ecommerce",
          fileName: "index",
          extension: "js",
          screenshots: {
            "default-slice": {
              path: "updated-screenshot-path",
              hash: "f92c69c60df8fd8eb42902bfb6574776",
              url: "http://localhost:9999/api/__preview?q=default-slice",
            },
          },
          mock: [],
          model: {
            id: modelId,
            type: "SharedSlice",
            name: "CategoryPreviewWithImageBackgrounds",
            description: "CategoryPreviewWithImageBackgrounds",
            variations: [
              {
                id: "default-slice",
                name: "Default slice",
                docURL: "...",
                version: "sktwi1xtmkfgx8626",
                description: "MockSlice",
                primary: [
                  {
                    key: "Title",
                    value: {
                      config: {
                        label: "Title",
                        placeholder: "My first Title...",
                      },
                      type: "Text",
                    },
                  },
                ],
                items: [],
              },
            ],
          },
          mockConfig: {},
        },
      ],
      meta: {
        isNodeModule: false,
        isDownloaded: false,
        isManual: true,
      },
    },
  ];

  return {
    env: dummyServerState.env,
    libraries: MOCK_UPDATED_LIBRARY,
    localCustomTypes: [],
    remoteCustomTypes: [],
    remoteSlices: [],
  };
};
