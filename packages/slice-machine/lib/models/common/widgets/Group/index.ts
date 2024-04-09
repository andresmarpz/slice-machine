import * as yup from "yup";
import { MdPlaylistAdd } from "react-icons/md";
import { Widget } from "../Widget";
import CustomListItem from "./ListItem";
import { GroupSM } from "@lib/models/common/Group";
import Form from "./Form";
import { DefaultFields } from "../../../../forms/defaults";

const Meta = {
  icon: MdPlaylistAdd,
  title: "Group",
  description: "A group of Prismic fields",
};

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Group$/, { excludeEmptyString: true })
    .required(),
  config: yup.object().shape({
    fields: yup.array(),
    label: yup.string(),
    placeholder: yup.string(),
    repeat: yup.boolean().isFalse(),
  }),
});

export const GroupWidget: Widget<GroupSM, typeof schema> = {
  Meta,
  Form,
  FormFields: DefaultFields,
  schema,
  create: (label: string) => ({
    type: "Group",
    config: {
      label,
      repeat: false,
      fields: [],
    },
  }),
  CustomListItem,
  TYPE_NAME: "Group",
};
