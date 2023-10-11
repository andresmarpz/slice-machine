import { type FC, type PropsWithChildren } from "react";
import { Switch, Box, Card, Icon, Text } from "@prismicio/editor-ui";

type LabsTableItemProps = PropsWithChildren<{
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void> | void;
}>;

export const LabsTableItem: FC<LabsTableItemProps> = ({
  title,
  enabled,
  onToggle,
  children,
}) => {
  return (
    <Card variant="outlined" style={{ padding: 0 }}>
      <Box gap={8} padding={16}>
        <Box padding={{ top: 6 }}>
          <Icon name="viewDay" size="medium" color="grey11" />
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Text variant="h3">{title}</Text>
          <Text variant="normal">{children}</Text>
        </Box>
        <Box width={128} justifyContent="end">
          <Switch
            size="medium"
            checked={enabled}
            onCheckedChange={(checked) => void onToggle(checked)}
          />
        </Box>
      </Box>
    </Card>
  );
};
