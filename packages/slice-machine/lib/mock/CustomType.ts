import {
  CustomType,
  flattenWidgets,
} from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  DocumentMockConfig,
  DocWidgetMockConfig,
  DocumentMock,
} from "@prismicio/mocks";
import { CustomTypeMockConfig } from "../models/common/MockConfig";
import { buildWidgetMockConfig } from "./LegacyMockConfig";
import { WidgetKey } from "@prismicio/types-internal/lib/documents/widgets";
import { CustomTypes, CustomTypeSM } from "@lib/models/common/CustomType";
import { Document } from "@prismicio/types-internal/lib/content";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

function buildDocumentMockConfig(
  model: CustomType,
  legacyMockConfig: CustomTypeMockConfig
): DocumentMockConfig {
  const widgets = flattenWidgets(model);
  const widgetsConfig = widgets.reduce<
    Partial<Record<WidgetKey, DocWidgetMockConfig>>
  >((acc, [key, w]) => {
    const legacyFieldConfig: Partial<Record<string, unknown>> | undefined =
      legacyMockConfig[key];
    if (!legacyFieldConfig) return acc;

    const widgetConfig = buildWidgetMockConfig(w, legacyFieldConfig);
    if (!widgetConfig) return acc;

    return { ...acc, [key]: widgetConfig };
  }, {});

  return { value: widgetsConfig };
}

export default function MockCustomType(
  model: CustomTypeSM,
  legacyMockConfig: CustomTypeMockConfig,
  sharedSlices: Record<string, SharedSlice>
): Partial<Document> {
  const prismicModel = CustomTypes.fromSM(model);
  const documentMockConfig = buildDocumentMockConfig(
    prismicModel,
    legacyMockConfig
  );

  return DocumentMock.generate(prismicModel, sharedSlices, documentMockConfig);
}
