import {
  CustomType,
  DynamicSection,
  DynamicSlicesConfig,
  Group,
  GroupFieldType,
  NestableWidget,
  SlicesFieldType,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import { removeKey } from "@prismicio/editor-support/Object";

import { CustomTypeFormat } from "@slicemachine/manager";

type DeleteSliceZoneSliceArgs = {
  customType: CustomType;
  sectionId: string;
  sliceId: string;
};

type AddFieldArgs = {
  customType: CustomType;
  sectionId: string;
  newField: NestableWidget | UID | Group;
  newFieldId: string;
};

type DeleteFieldArgs = {
  customType: CustomType;
  sectionId: string;
  fieldId: string;
};

type UpdateFieldArgs = {
  customType: CustomType;
  sectionId: string;
  previousFieldId: string;
  newFieldId: string;
  newField: NestableWidget | UID | Group;
};

type ReorderFieldArgs = {
  customType: CustomType;
  sectionId: string;
  sourceIndex: number;
  destinationIndex: number;
};

type AddGroupField = {
  customType: CustomType;
  sectionId: string;
  groupFieldId: string;
  newField: NestableWidget;
  newFieldId: string;
};

type DeleteGroupField = {
  customType: CustomType;
  sectionId: string;
  groupFieldId: string;
  fieldId: string;
};

type UpdateGroupFieldArgs = {
  customType: CustomType;
  sectionId: string;
  groupFieldId: string;
  previousFieldId: string;
  newFieldId: string;
  newField: NestableWidget;
};

type ReorderGroupFieldArgs = {
  customType: CustomType;
  sectionId: string;
  groupFieldId: string;
  sourceIndex: number;
  destinationIndex: number;
};

type UpdateSectionArgs = {
  customType: CustomType;
  sectionId: string;
  updatedSection: DynamicSection;
};

type UpdateFieldsArgs<T> = {
  fields: Record<string, T>;
  previousFieldId: string;
  newFieldId: string;
  newField: T;
};

type ReorderFieldsArgs<T> = {
  fields: Record<string, T>;
  sourceIndex: number;
  destinationIndex: number;
};

type GetGroupFieldArgs = {
  customType: CustomType;
  sectionId: string;
  groupFieldId: string;
};

export function getFormat(custom: CustomType): CustomTypeFormat {
  return custom.format ?? "custom";
}

export function getSectionEntries(
  customType: CustomType,
): [string, DynamicSection][] {
  return Object.entries(customType.json);
}

export function getMainSectionEntry(
  customType: CustomType,
): [string, DynamicSection] | undefined {
  // Currently we cannot rely on the name of the main section
  // since it's possible to rename it
  const sections = getSectionEntries(customType);
  return sections[0];
}

export function getSection(
  customType: CustomType,
  sectionId: string,
): DynamicSection | undefined {
  return customType.json[sectionId];
}

export function getSectionSliceZoneConfig(
  customType: CustomType,
  sectionId: string,
): DynamicSlicesConfig | undefined {
  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return undefined;
  }

  // In Slice Machine we currently only support one slice zone per section
  // so we retrieve the first one
  const maybeSliceZone = Object.values(section).find(
    (value) => value.type === SlicesFieldType,
  );

  return maybeSliceZone?.config ?? undefined;
}

// Find the next available key for a slice zone
// Each section slice zone must have a unique key because
// all slice zones from a custom type are flattened and
// it's used as an API id
export function findNextSectionSliceZoneKey(
  customType: CustomType,
  sectionId: string,
): string {
  const sectionsEntries = getSectionEntries(customType);
  const sectionIndex = sectionsEntries.findIndex(([key]) => key === sectionId);

  const existingKeys = sectionsEntries.flatMap(([_, section]) =>
    Object.keys(section).filter((key) => section[key].type === SlicesFieldType),
  );

  let i = sectionIndex;
  let proposedKey;
  do {
    proposedKey = `slices${i !== 0 ? i.toString() : ""}`;
    i++;
  } while (existingKeys.includes(proposedKey));

  return proposedKey;
}

export function createSectionSliceZone(
  customType: CustomType,
  sectionId: string,
): CustomType {
  const maybeSectionSliceZoneConfig = getSectionSliceZoneConfig(
    customType,
    sectionId,
  );

  // If the section already has a slice zone, return the custom type as is
  if (maybeSectionSliceZoneConfig) {
    return customType;
  }

  // Get the next available section key for the slice zone
  const availableSectionSlicesKey = findNextSectionSliceZoneKey(
    customType,
    sectionId,
  );

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: {
        ...customType.json[sectionId],
        [availableSectionSlicesKey]: {
          type: SlicesFieldType,
          fieldset: "Slice Zone",
        },
      },
    },
  };
}

export function deleteSectionSliceZone(
  customType: CustomType,
  sectionId: string,
): CustomType {
  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return customType;
  }

  const sliceZoneKey = Object.keys(section).find(
    (key) => section[key].type === SlicesFieldType,
  );

  if (sliceZoneKey === undefined) {
    return customType;
  }

  const newSection = removeKey(section, sliceZoneKey);

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: newSection,
    },
  };
}

export function deleteSliceZoneSlice(
  args: DeleteSliceZoneSliceArgs,
): CustomType {
  const { customType, sectionId, sliceId } = args;

  const section = getSection(customType, sectionId);

  if (section === undefined) {
    return customType;
  }

  const sliceZoneKey = Object.keys(section).find(
    (key) => section[key].type === SlicesFieldType,
  );

  if (sliceZoneKey === undefined) {
    return customType;
  }

  const sliceZone = section[sliceZoneKey];

  if (sliceZone.type !== SlicesFieldType) {
    return customType;
  }

  const newChoices = removeKey(sliceZone.config?.choices ?? {}, sliceId);

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: {
        ...section,
        [sliceZoneKey]: {
          ...sliceZone,
          config: {
            ...sliceZone.config,
            choices: newChoices,
          },
        },
      },
    },
  };
}

export function convertToPageType(customType: CustomType): CustomType {
  let newCustomType: CustomType = {
    ...customType,
    format: "page",
  };

  // Create the slice zone for the main section if it doesn't exist
  const mainSectionEntry = getMainSectionEntry(customType);
  if (mainSectionEntry) {
    const [mainSectionKey] = mainSectionEntry;
    newCustomType = createSectionSliceZone(newCustomType, mainSectionKey);
  }

  return newCustomType;
}

export function createSection(customType: CustomType, sectionId: string) {
  return {
    ...customType,
    json: {
      ...customType.json,
      // Create the empty section
      [sectionId]: {},
    },
  };
}

export function deleteSection(customType: CustomType, sectionId: string) {
  const newJson = removeKey(customType.json, sectionId);

  return {
    ...customType,
    json: newJson,
  };
}

export function renameSection(
  customType: CustomType,
  sectionId: string,
  newSectionId: string,
) {
  if (sectionId === newSectionId) {
    return customType;
  }

  const newJson = Object.keys(customType.json).reduce(
    (acc: CustomType["json"], key) => {
      if (key === sectionId) {
        // Rename the section
        acc[newSectionId] = customType.json[key];
      } else {
        // Retain all other sections as they are
        acc[key] = customType.json[key];
      }
      return acc;
    },
    {},
  );

  return {
    ...customType,
    json: newJson,
  };
}

export function addField(args: AddFieldArgs): CustomType {
  const { customType, sectionId, newField, newFieldId } = args;

  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection: {
      ...customType.json[sectionId],
      // Add the new field to the section
      [newFieldId]: newField,
    },
  });

  return newCustomType;
}

export function deleteField(args: DeleteFieldArgs): CustomType {
  const { customType, sectionId, fieldId } = args;

  const updatedSection = removeKey(customType.json[sectionId], fieldId);
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function updateField(args: UpdateFieldArgs): CustomType {
  const { customType, sectionId, previousFieldId, newFieldId, newField } = args;

  const updatedSection = updateFields({
    fields: customType.json[sectionId],
    previousFieldId,
    newFieldId,
    newField,
  });
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function reorderField(args: ReorderFieldArgs): CustomType {
  const { customType, sectionId, sourceIndex, destinationIndex } = args;
  const sectionJson = customType.json[sectionId];
  const slicesField = sectionJson[SlicesFieldType];

  // Separate the fields into slices and non-slices
  const sectionFields = Object.fromEntries(
    Object.entries(sectionJson).filter(
      ([_, value]) => value.type !== SlicesFieldType,
    ),
  );

  const updatedSection = reorderFields({
    fields: sectionFields,
    sourceIndex,
    destinationIndex,
  });

  // Merge the SlicesFieldType field back into the section, if it exists
  if (slicesField !== undefined) {
    updatedSection[SlicesFieldType] = slicesField;
  }

  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection,
  });

  return newCustomType;
}

export function addGroupField(args: AddGroupField): CustomType {
  const { customType, sectionId, groupFieldId, newField, newFieldId } = args;
  const groupField = getGroupField({
    customType,
    sectionId,
    groupFieldId,
  });
  const groupFields = groupField?.config?.fields;

  if (!groupField) {
    return customType;
  }

  const newGroupField = updateGroupFields(groupField, {
    ...groupFields,
    // Add the new field to the group fields
    [newFieldId]: newField,
  });
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection: {
      ...customType.json[sectionId],
      [groupFieldId]: newGroupField,
    },
  });

  return newCustomType;
}

export function deleteGroupField(args: DeleteGroupField): CustomType {
  const { customType, sectionId, groupFieldId, fieldId } = args;
  const groupField = getGroupField({
    customType,
    sectionId,
    groupFieldId,
  });
  const groupFields = groupField?.config?.fields;

  if (!groupField || !groupFields) {
    return customType;
  }

  const updatedFields = removeKey(groupFields, fieldId);
  const newGroupField = updateGroupFields(groupField, updatedFields);
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection: {
      ...customType.json[sectionId],
      [groupFieldId]: newGroupField,
    },
  });

  return newCustomType;
}

export function updateGroupField(args: UpdateGroupFieldArgs): CustomType {
  const {
    customType,
    sectionId,
    groupFieldId,
    previousFieldId,
    newFieldId,
    newField,
  } = args;
  const groupField = getGroupField({
    customType,
    sectionId,
    groupFieldId,
  });
  const groupFields = groupField?.config?.fields;

  if (!groupField || !groupFields) {
    return customType;
  }

  const updatedGroupFields = updateFields({
    fields: groupFields,
    previousFieldId,
    newFieldId,
    newField,
  });
  const newGroupField = updateGroupFields(groupField, updatedGroupFields);
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection: {
      ...customType.json[sectionId],
      [groupFieldId]: newGroupField,
    },
  });

  return newCustomType;
}

export function reorderGroupField(args: ReorderGroupFieldArgs): CustomType {
  const { customType, sectionId, groupFieldId, sourceIndex, destinationIndex } =
    args;
  const groupField = getGroupField({
    customType,
    sectionId,
    groupFieldId,
  });
  const groupFields = groupField?.config?.fields;

  if (!groupField || !groupFields) {
    return customType;
  }

  const updatedGroupFields = reorderFields({
    fields: groupFields,
    sourceIndex,
    destinationIndex,
  });
  const newGroupField = updateGroupFields(groupField, updatedGroupFields);
  const newCustomType = updateSection({
    customType,
    sectionId,
    updatedSection: {
      ...customType.json[sectionId],
      [groupFieldId]: newGroupField,
    },
  });

  return newCustomType;
}

export function updateSection(args: UpdateSectionArgs): CustomType {
  const { customType, sectionId, updatedSection } = args;

  return {
    ...customType,
    json: {
      ...customType.json,
      [sectionId]: updatedSection,
    },
  };
}

export function updateFields<T>(args: UpdateFieldsArgs<T>): Record<string, T> {
  const { fields, previousFieldId, newFieldId, newField } = args;

  return Object.entries(fields).reduce(
    (acc, [key, value]) => {
      if (key === previousFieldId) {
        // If the current key is the previous field ID, replace it with the new field.
        acc[newFieldId] = newField;
      } else if (key !== newFieldId) {
        // Retain all other fields as they are.
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, T>,
  );
}

export function reorderFields<T>(args: ReorderFieldsArgs<T>) {
  const { fields, sourceIndex, destinationIndex } = args;

  const fieldEntries = Object.entries(fields);
  const [removedEntry] = fieldEntries.splice(sourceIndex, 1);
  fieldEntries.splice(destinationIndex, 0, removedEntry);
  const reorderedFields = Object.fromEntries(fieldEntries);

  return reorderedFields;
}

export function getGroupField(args: GetGroupFieldArgs): Group | undefined {
  const { customType, sectionId, groupFieldId } = args;
  const field = customType.json[sectionId][groupFieldId];

  if (field.type === GroupFieldType) {
    return field;
  }

  return undefined;
}

export function updateGroupFields(
  field: Group,
  updatedGroupFields: Record<string, NestableWidget>,
): Group {
  return {
    ...field,
    config: {
      ...field.config,
      fields: updatedGroupFields,
    },
  };
}
