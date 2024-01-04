import { describe, expect } from "vitest";

import {
  CustomType,
  DynamicSection,
  Group,
} from "@prismicio/types-internal/lib/customtypes";

import * as CustomTypeModel from "../customType";

describe("CustomTypeModel test suite", () => {
  const mainSection: DynamicSection = {
    uid: {
      config: {
        label: "MainSectionField",
      },
      type: "UID",
    },
    booleanField: {
      config: {
        label: "BooleanField",
      },
      type: "Boolean",
    },
    groupField: {
      type: "Group",
      config: {
        label: "MyGroupField",
        fields: {
          groupFieldBooleanField: {
            config: {
              label: "GroupFieldBooleanField",
            },
            type: "Boolean",
          },
          groupFieldTextField: {
            config: {
              label: "GroupFieldTextField",
            },
            type: "Text",
          },
        },
      },
    },
    slices: {
      type: "Slices",
      fieldset: "Slice Zone",
      config: {
        choices: {
          hero_banner: {
            type: "SharedSlice",
          },
          promo_section_image_tiles: {
            type: "SharedSlice",
          },
        },
      },
    },
  };
  const anotherSection: DynamicSection = {
    uid: {
      config: {
        label: "AnotherSectionField",
      },
      type: "UID",
    },
  };
  const mockCustomType: CustomType = {
    format: "custom",
    id: "id",
    json: {
      mainSection,
      anotherSection,
    },
    label: "lama",
    repeatable: true,
    status: true,
  };

  it("getFormat should return the format 'custom' of the given custom type", () => {
    expect(CustomTypeModel.getFormat(mockCustomType)).toEqual("custom");
  });

  it("getFormat should return the format 'page' of the given custom type", () => {
    expect(
      CustomTypeModel.getFormat({
        ...mockCustomType,
        format: "page",
      }),
    ).toEqual("page");
  });

  it("getSectionEntries should return the sections entries", () => {
    expect(CustomTypeModel.getSectionEntries(mockCustomType)).toEqual([
      ["mainSection", mainSection],
      ["anotherSection", anotherSection],
    ]);
  });

  it("getSectionEntries should return an empty array if there are no sections", () => {
    expect(
      CustomTypeModel.getSectionEntries({
        ...mockCustomType,
        json: {},
      }),
    ).toEqual([]);
  });

  it("getMainSectionEntry should return the first section even if not named Main", () => {
    expect(CustomTypeModel.getMainSectionEntry(mockCustomType)).toEqual([
      "mainSection",
      mainSection,
    ]);
  });

  it("getMainSectionEntry should return undefined if there is are sections", () => {
    expect(
      CustomTypeModel.getMainSectionEntry({
        ...mockCustomType,
        json: {},
      }),
    ).toEqual(undefined);
  });

  it("getSection should return the section matching the key", () => {
    expect(
      CustomTypeModel.getSection(mockCustomType, "anotherSection"),
    ).toEqual(anotherSection);
  });

  it("getSection should return undefined if there are no sections", () => {
    expect(
      CustomTypeModel.getSection(
        {
          ...mockCustomType,
          json: {},
        },
        "mainSection",
      ),
    ).toEqual(undefined);
  });

  it("getSectionSliceZoneEntry should return the slice zone of the given section", () => {
    expect(
      CustomTypeModel.getSectionSliceZoneEntry(mockCustomType, "mainSection"),
    ).toEqual([
      "slices",
      {
        type: "Slices",
        fieldset: "Slice Zone",
        config: {
          choices: {
            hero_banner: {
              type: "SharedSlice",
            },
            promo_section_image_tiles: {
              type: "SharedSlice",
            },
          },
        },
      },
    ]);
  });

  it("getSectionSliceZoneConfig should return the config of the given section", () => {
    expect(
      CustomTypeModel.getSectionSliceZoneConfig(mockCustomType, "mainSection"),
    ).toEqual({
      choices: {
        hero_banner: {
          type: "SharedSlice",
        },
        promo_section_image_tiles: {
          type: "SharedSlice",
        },
      },
    });
  });

  it("getSectionSliceZoneConfig should return undefined if there are no sections", () => {
    expect(
      CustomTypeModel.getSectionSliceZoneConfig(
        {
          ...mockCustomType,
          json: {},
        },
        "mainSection",
      ),
    ).toEqual(undefined);
  });

  it("findNextSectionSliceZoneKey should return 'slices'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        {
          ...mockCustomType,
          json: {
            anotherSection: {},
          },
        },
        "anotherSection",
      ),
    ).toEqual("slices");
  });

  it("findNextSectionSliceZoneKey should return 'slices1'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        mockCustomType,
        "anotherSection",
      ),
    ).toEqual("slices1");
  });

  it("findNextSectionSliceZoneKey should return 'slices2'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        {
          ...mockCustomType,
          json: {
            mainSection,
            SecondSection: {
              slices1: {
                type: "Slices",
              },
            },
            anotherSection,
          },
        },
        "anotherSection",
      ),
    ).toEqual("slices2");
  });

  it("findNextSectionSliceZoneKey should return 'slices3'", () => {
    expect(
      CustomTypeModel.findNextSectionSliceZoneKey(
        {
          ...mockCustomType,
          json: {
            mainSection,
            SecondSection: {
              slices2: {
                type: "Slices",
              },
            },
            anotherSection,
          },
        },
        "anotherSection",
      ),
    ).toEqual("slices3");
  });

  it("createSectionSliceZone should return the given custom type with a slice zone for given section", () => {
    expect(
      CustomTypeModel.createSectionSliceZone(mockCustomType, "anotherSection"),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        anotherSection: {
          ...anotherSection,
          slices1: {
            type: "Slices",
            fieldset: "Slice Zone",
          },
        },
      },
    });
  });

  it("createSectionSliceZone should return the same custom type if slice zone already exist for given section", () => {
    expect(
      CustomTypeModel.createSectionSliceZone(mockCustomType, "mainSection"),
    ).toEqual(mockCustomType);
  });

  it("deleteSectionSliceZone should return the custom type without the slice zone deleted", () => {
    expect(
      CustomTypeModel.deleteSectionSliceZone(mockCustomType, "mainSection"),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          uid: mainSection.uid,
          booleanField: mainSection.booleanField,
          groupField: mainSection.groupField,
        },
        anotherSection,
      },
    });
  });

  it("deleteSliceZoneSlice should return the custom type without the slice deleted", () => {
    expect(
      CustomTypeModel.deleteSliceZoneSlice({
        customType: mockCustomType,
        sectionId: "mainSection",
        sliceId: "hero_banner",
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          ...mainSection,
          slices: {
            ...mainSection.slices,
            config: {
              ...mainSection.slices.config,
              choices: {
                promo_section_image_tiles: {
                  type: "SharedSlice",
                },
              },
            },
          },
        },
        anotherSection,
      },
    });
  });

  it("convertToPageType should convert the given custom type", () => {
    expect(CustomTypeModel.convertToPageType(mockCustomType)).toEqual({
      ...mockCustomType,
      format: "page",
    });
  });

  it("convertToPageType should convert the given custom type with a slice zone for Main section when it doesn't exist", () => {
    expect(
      CustomTypeModel.convertToPageType({
        ...mockCustomType,
        json: {
          mainSection: {},
          anotherSection,
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection: {
          slices: {
            type: "Slices",
            fieldset: "Slice Zone",
          },
        },
        anotherSection,
      },
      format: "page",
    });
  });

  it("createSection should return the given custom type with the new section", () => {
    expect(CustomTypeModel.createSection(mockCustomType, "newSection")).toEqual(
      {
        ...mockCustomType,
        json: {
          ...mockCustomType.json,
          newSection: {},
        },
      },
    );
  });

  it("deleteSection should return the given custom type without the section", () => {
    expect(
      CustomTypeModel.deleteSection(mockCustomType, "anotherSection"),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection,
      },
    });
  });

  it("renameSection should return the given custom type with the section renamed", () => {
    expect(
      CustomTypeModel.renameSection(
        mockCustomType,
        "anotherSection",
        "newSection",
      ),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection,
        newSection: anotherSection,
      },
    });
  });

  it("addField should return the given custom type with the field added to the section", () => {
    expect(
      CustomTypeModel.addField({
        customType: mockCustomType,
        sectionId: "mainSection",
        newFieldId: "newField",
        newField: {
          config: {
            label: "NewField",
          },
          type: "UID",
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          ...mainSection,
          newField: {
            config: {
              label: "NewField",
            },
            type: "UID",
          },
        },
      },
    });
  });

  it("deleteField should return the given custom type without the field", () => {
    expect(
      CustomTypeModel.deleteField({
        customType: mockCustomType,
        sectionId: "mainSection",
        fieldId: "booleanField",
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          uid: mainSection.uid,
          groupField: mainSection.groupField,
          slices: mainSection.slices,
        },
      },
    });
  });

  it("updateField should return the given custom type with the field updated", () => {
    expect(
      CustomTypeModel.updateField({
        customType: mockCustomType,
        sectionId: "mainSection",
        previousFieldId: "booleanField",
        newFieldId: "newId",
        newField: {
          config: {
            label: "newLabel",
          },
          type: "Boolean",
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          uid: mainSection.uid,
          newId: {
            config: {
              label: "newLabel",
            },
            type: "Boolean",
          },
          groupField: mainSection.groupField,
          slices: mainSection.slices,
        },
      },
    });
  });

  it("reorderField should return the given custom type with the field reordered", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.reorderField({
          customType: mockCustomType,
          sectionId: "mainSection",
          sourceIndex: 0,
          destinationIndex: 1,
        }),
      ),
    ).toEqual(
      JSON.stringify({
        ...mockCustomType,
        json: {
          ...mockCustomType.json,
          mainSection: {
            booleanField: mainSection.booleanField,
            uid: mainSection.uid,
            groupField: mainSection.groupField,
            slices: mainSection.slices,
          },
        },
      }),
    );
  });

  it("addGroupField should return the given custom type with the group field added", () => {
    expect(
      CustomTypeModel.addGroupField({
        customType: mockCustomType,
        sectionId: "mainSection",
        groupFieldId: "groupField",
        newFieldId: "newFieldId",
        newField: {
          config: {
            label: "NewField",
          },
          type: "Boolean",
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          ...mainSection,
          groupField: {
            ...mainSection.groupField,
            config: {
              ...mainSection.groupField.config,
              fields: {
                ...(mainSection.groupField as Group).config?.fields,
                newFieldId: {
                  config: {
                    label: "NewField",
                  },
                  type: "Boolean",
                },
              },
            },
          },
        },
      },
    });
  });

  it("deleteGroupField should return the given custom type without the group field", () => {
    expect(
      CustomTypeModel.deleteGroupField({
        customType: mockCustomType,
        sectionId: "mainSection",
        groupFieldId: "groupField",
        fieldId: "groupFieldBooleanField",
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          ...mainSection,
          groupField: {
            ...mainSection.groupField,
            config: {
              ...mainSection.groupField.config,
              fields: {
                groupFieldTextField: (mainSection.groupField as Group).config
                  ?.fields?.groupFieldTextField,
              },
            },
          },
        },
      },
    });
  });

  it("updateGroupField should return the given custom type with the group field updated", () => {
    expect(
      CustomTypeModel.updateGroupField({
        customType: mockCustomType,
        sectionId: "mainSection",
        groupFieldId: "groupField",
        previousFieldId: "groupFieldBooleanField",
        newFieldId: "newId",
        newField: {
          config: {
            label: "newLabel",
          },
          type: "Boolean",
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        ...mockCustomType.json,
        mainSection: {
          ...mainSection,
          groupField: {
            ...mainSection.groupField,
            config: {
              ...mainSection.groupField.config,
              fields: {
                newId: {
                  config: {
                    label: "newLabel",
                  },
                  type: "Boolean",
                },
                groupFieldTextField: (mainSection.groupField as Group).config
                  ?.fields?.groupFieldTextField,
              },
            },
          },
        },
      },
    });
  });

  it("reorderGroupField should return the given custom type with the group field reordered", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.reorderGroupField({
          customType: mockCustomType,
          sectionId: "mainSection",
          groupFieldId: "groupField",
          sourceIndex: 0,
          destinationIndex: 1,
        }),
      ),
    ).toEqual(
      JSON.stringify({
        ...mockCustomType,
        json: {
          ...mockCustomType.json,
          mainSection: {
            ...mainSection,
            groupField: {
              ...mainSection.groupField,
              config: {
                ...mainSection.groupField.config,
                fields: {
                  groupFieldTextField: (mainSection.groupField as Group).config
                    ?.fields?.groupFieldTextField,
                  groupFieldBooleanField: (mainSection.groupField as Group)
                    .config?.fields?.groupFieldBooleanField,
                },
              },
            },
          },
        },
      }),
    );
  });

  it("updateSection should return the given custom type with the section updated", () => {
    expect(
      CustomTypeModel.updateSection({
        customType: mockCustomType,
        sectionId: "anotherSection",
        updatedSection: {
          uid: {
            config: {
              label: "AnotherSectionFieldUpdated",
            },
            type: "UID",
          },
        },
      }),
    ).toEqual({
      ...mockCustomType,
      json: {
        mainSection,
        anotherSection: {
          uid: {
            config: {
              label: "AnotherSectionFieldUpdated",
            },
            type: "UID",
          },
        },
      },
    });
  });

  it("updateFields should return the updated fields", () => {
    expect(
      CustomTypeModel.updateFields({
        fields: {
          booleanField: {
            config: {
              label: "BooleanFieldUpdated",
            },
            type: "Boolean",
          },
        },
        previousFieldId: "booleanField",
        newFieldId: "newField",
        newField: {
          config: {
            label: "NewField",
          },
          type: "UID",
        },
      }),
    ).toEqual({
      newField: {
        config: {
          label: "NewField",
        },
        type: "UID",
      },
    });
  });

  it("reorderFields should return the reordered fields", () => {
    expect(
      JSON.stringify(
        CustomTypeModel.reorderFields({
          fields: {
            booleanField: {
              config: {
                label: "BooleanField",
              },
              type: "Boolean",
            },
            textField: {
              config: {
                label: "TextField",
              },
              type: "Text",
            },
          },
          sourceIndex: 0,
          destinationIndex: 1,
        }),
      ),
    ).toEqual(
      JSON.stringify({
        textField: {
          config: {
            label: "TextField",
          },
          type: "Text",
        },
        booleanField: {
          config: {
            label: "BooleanField",
          },
          type: "Boolean",
        },
      }),
    );
  });

  it("getGroupField should return the group field matching the key", () => {
    expect(
      CustomTypeModel.getGroupField({
        customType: mockCustomType,
        sectionId: "mainSection",
        groupFieldId: "groupField",
      }),
    ).toEqual(mainSection.groupField);
  });

  it("updateGroupFields should return the updated group fields", () => {
    expect(
      CustomTypeModel.updateGroupFields(mainSection.groupField as Group, {
        groupFieldBooleanField: {
          config: {
            label: "GroupFieldBooleanField",
          },
          type: "Boolean",
        },
      }),
    ).toEqual({
      ...mainSection.groupField,
      config: {
        ...mainSection.groupField.config,
        fields: {
          groupFieldBooleanField: {
            config: {
              label: "GroupFieldBooleanField",
            },
            type: "Boolean",
          },
        },
      },
    });
  });
});
