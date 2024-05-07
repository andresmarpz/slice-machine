import { Box, useMediaQuery } from "@prismicio/editor-ui";
import { type FC } from "react";

import { BreadcrumbItem } from "@/components/Breadcrumb";
import { AutoSaveStatusIndicator } from "@/features/autoSave/AutoSaveStatusIndicator";
import { FloatingBackButton } from "@/features/slices/sliceBuilder/FloatingBackButton";
import { useSliceState } from "@/features/slices/sliceBuilder/SliceBuilderProvider";
import {
  AppLayout,
  AppLayoutActions,
  AppLayoutBackButton,
  AppLayoutBreadcrumb,
  AppLayoutContent,
  AppLayoutHeader,
} from "@/legacy/components/AppLayout";
import SimulatorButton from "@/legacy/lib/builders/SliceBuilder/SimulatorButton";

import FieldZones from "./FieldZones";
import { Sidebar } from "./Sidebar";

export const SliceBuilder: FC = () => {
  const { slice, actionQueueStatus } = useSliceState();
  const horizontalScroll = useMediaQuery({ max: "medium" });

  const contentDisplayProps = horizontalScroll
    ? {
        gridTemplateRows: "320px 1fr",
      }
    : {
        gridTemplateColumns: "320px 1fr",
        gap: 16 as const,
      };

  return (
    <AppLayout>
      <AppLayoutHeader>
        <AppLayoutBackButton url="/slices" />
        <AppLayoutBreadcrumb>
          <BreadcrumbItem>Slices</BreadcrumbItem>
          <BreadcrumbItem active>{slice.model.name}</BreadcrumbItem>
        </AppLayoutBreadcrumb>
        <AppLayoutActions>
          <AutoSaveStatusIndicator status={actionQueueStatus} />
          <SimulatorButton disabled={actionQueueStatus !== "done"} />
        </AppLayoutActions>
      </AppLayoutHeader>
      <AppLayoutContent>
        <Box display="grid" alignItems="flex-start" {...contentDisplayProps}>
          <Sidebar horizontalScroll={horizontalScroll} />
          <FieldZones />
        </Box>
        <FloatingBackButton />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default SliceBuilder;
