import { Fragment, useState } from "react";
import { flushSync } from "react-dom";

import { DragDropContext, Droppable } from "react-beautiful-dnd";

import { Box, Button } from "theme-ui";

import { ensureDnDDestination, ensureWidgetTypeExistence } from "@lib/utils";

import { transformKeyAccessor } from "@utils/str";

import SelectFieldTypeModal from "@lib/builders/common/SelectFieldTypeModal";
import NewField from "@lib/builders/common/Zone/Card/components/NewField";
import EditModal from "@lib/builders/common/EditModal";

import { findWidgetByConfigOrType } from "@builders/utils";

import * as Widgets from "@lib/models/common/widgets";

import sliceBuilderArray from "@lib/models/common/widgets/sliceBuilderArray";

import Hint from "@lib/builders/common/Zone/Card/components/Hints";

import ListItem from "@components/ListItem";
import { useCustomTypeState } from "@src/features/customTypes/customTypesBuilder/CustomTypeProvider";
import { TabFieldsModel } from "@lib/models/common/CustomType";
import {
  addGroupField,
  deleteGroupField,
  reorderGroupField,
  updateGroupField,
} from "@src/domain/customType";
import { telemetry } from "@src/apiClient";

/* eslint-disable */
const CustomListItem = ({
  tabId,
  widget,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parentSnapshot,
  showHints,
  isRepeatable,
  item: groupItem,
  draggableId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderFieldAccessor,
  ...rest
}) => {
  const [selectMode, setSelectMode] = useState(false);
  const [newFieldData, setNewFieldData] = useState(null);
  const [editModalData, setEditModalData] = useState({ isOpen: false });
  const { customType, setCustomType } = useCustomTypeState();

  const onSelectFieldType = (widgetTypeName) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setNewFieldData({ widgetTypeName });
    setSelectMode(false);
  };

  const onCancelNewField = () => {
    setNewFieldData(null);
  };

  const closeEditModal = () => {
    setEditModalData({ isOpen: false });
  };

  const onSaveNewField = ({ id, label, widgetTypeName }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const widget = Widgets[widgetTypeName];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const newWidget = widget.create(label);

    const newField = TabFieldsModel.fromSM(newWidget);
    const newCustomType = addGroupField({
      customType,
      sectionId: tabId,
      groupFieldId: groupItem.key,
      newField,
      newFieldId: id,
    });

    setCustomType(newCustomType);

    void telemetry.track({
      event: "field:added",
      id,
      name: label,
      type: widgetTypeName,
      isInAGroup: true,
      contentType: customType.format === "page" ? "page type" : "custom type",
    });
  };

  const onSaveField = ({ apiId: previousKey, newKey, value }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    if (ensureWidgetTypeExistence(Widgets, value.type)) {
      return;
    }

    const newField = TabFieldsModel.fromSM(value);
    const newCustomType = updateGroupField({
      customType,
      sectionId: tabId,
      groupFieldId: groupItem.key,
      previousFieldId: previousKey,
      newFieldId: newKey,
      newField,
    });

    setCustomType(newCustomType);
  };

  const onDragEnd = (result) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (ensureDnDDestination(result)) {
      return;
    }

    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const { index: sourceIndex } = source;
    const { index: destinationIndex } = destination;

    const newCustomType = reorderGroupField({
      customType,
      sectionId: tabId,
      groupFieldId: groupItem.key,
      sourceIndex,
      destinationIndex,
    });

    // When removing redux and replacing it by a simple useState, react-beautiful-dnd (that is deprecated library) was making the fields flickering on reorder.
    // The problem seems to come from the react non-synchronous way to handle our state update that didn't work well with the library.
    // It's a hack and since it's used on an old pure JavaScript code with a deprecated library it will be removed when updating the UI of the fields.
    flushSync(() => setCustomType(newCustomType));
  };

  const onDeleteItem = (key) => {
    const newCustomType = deleteGroupField({
      customType,
      sectionId: tabId,
      groupFieldId: groupItem.key,
      fieldId: key,
    });

    setCustomType(newCustomType);
  };

  /** @param {[string, import("@prismicio/types-internal/lib/customtypes").NestableWidget]} field */
  const enterEditMode = (field) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setEditModalData({ isOpen: true, field });

    const [id, model] = field;
    void telemetry.track({
      event: "field:settings-opened",
      id,
      name: model.config.label,
      type: model.type,
      isInAGroup: true,
      contentType: customType.format === "page" ? "page type" : "custom type",
    });
  };
  return (
    <Fragment>
      <ListItem
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        item={groupItem}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        widget={widget}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        draggableId={draggableId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
        renderFieldAccessor={(key) => `data.${groupItem.key}.[...]`}
        {...rest}
        CustomEditElements={[
          <Button
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            key={`custom-edit-element-${groupItem.key}`}
            mr={2}
            variant="buttons.darkSmall"
            onClick={() => setSelectMode(true)}
          >
            Add Field
          </Button>,
        ]}
        children={
          <Box sx={{ ml: 4 }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                droppableId={`${tabId}-${groupItem.key}-zone`}
              >
                {(provided) => (
                  <ul ref={provided.innerRef} {...provided.droppableProps}>
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                      groupItem.value.config.fields.map((item, index) => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        const {
                          value: { config, type },
                        } = item;
                        const widget = findWidgetByConfigOrType(
                          Widgets,
                          config,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          type,
                        );
                        if (!widget) {
                          return null;
                        }

                        const props = {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                          item,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                          index,
                          widget,
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          key: item.key,
                          enterEditMode,
                          deleteItem: onDeleteItem,
                          renderFieldAccessor: (key) =>
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
                            `data.${groupItem.key}.${key}`,
                          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
                          draggableId: `group-${groupItem.key}-${item.key}-${index}`,
                          testId: `list-item-group-${groupItem.key}-${item.key}`,
                        };

                        const HintElement = (
                          <Hint
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                            item={item}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            show={showHints}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            isRepeatable={isRepeatable}
                            renderHintBase={({ item }) =>
                              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                              `data.${groupItem.key}${transformKeyAccessor(
                                item.key,
                              )}`
                            }
                            Widgets={Widgets}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                          />
                        );
                        return (
                          <ListItem {...props} HintElement={HintElement} />
                        );
                      })
                    }
                    {provided.placeholder}

                    {newFieldData && (
                      <NewField
                        {...newFieldData}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        fields={groupItem.value.config.fields || []}
                        onSave={(...args) => {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          onSaveNewField(...args);
                          setNewFieldData(null);
                        }}
                        onCancelNewField={onCancelNewField}
                      />
                    )}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        }
      />
      <SelectFieldTypeModal
        data={{ isOpen: selectMode }}
        close={() => setSelectMode(false)}
        onSelect={onSelectFieldType}
        widgetsArray={sliceBuilderArray}
      />
      <EditModal
        data={editModalData}
        close={closeEditModal}
        onSave={onSaveField}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        fields={groupItem.value.config.fields}
      />
    </Fragment>
  );
};

export default CustomListItem;
/* eslint-enable */
