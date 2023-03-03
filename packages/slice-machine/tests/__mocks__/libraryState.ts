import type { Models } from "@slicemachine/core";

export const MockLibraryInfo: (
  lib: string
) => Models.Library<Models.Component> = (lib: string) => ({
  name: lib,
  path: "/test/slices",
  isLocal: true,
  components: [
    {
      from: lib,
      href: "http://myscreenshotuploaded",
      pathToSlice: "/slice1",
      fileName: "slice1/models.json",
      extension: "js",
      screenshots: {},
      model: {
        id: "sliceId",
        type: "SharedSlice",
        name: "SliceName",
        description: "slice description",
        variations: [
          {
            id: "default-slice",
            imageUrl: "",
            name: "Default slice",
            docURL: "...",
            version: "sktwi1xtmkfgx8626",
            description: "MyAwesomeSlice",
            primary: [
              {
                key: "title",
                value: {
                  type: "StructuredText",
                  config: {
                    single: "heading1",
                    label: "Title",
                    placeholder: "This is where it all begins...",
                  },
                },
              },
              {
                key: "description",
                value: {
                  type: "StructuredText",
                  config: {
                    single: "paragraph",
                    label: "Description",
                    placeholder: "A nice description of your product",
                  },
                },
              },
            ],
            items: [],
          },
        ],
      },
    },
  ],
});
