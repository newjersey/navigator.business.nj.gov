import { GenericTextField } from "@/components/GenericTextField";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "WIP/TextField",
  component: GenericTextField,
  decorators: [(Story) => <div className="width-widescreen  border">{Story()}</div>],

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1469",
    },
  },
} as ComponentMeta<typeof GenericTextField>;

const Template: ComponentStory<typeof GenericTextField> = (props) => {
  const hr = <hr className={"margin-0-override"} />;

  return (
    <>
      {hr}
      <GenericTextField fieldName={"Test1"} inputWidth={"full"} />
      {hr}
      <GenericTextField fieldName={"Test1"} inputWidth={"default"} /> {hr}
      <GenericTextField fieldName={"Test1"} inputWidth={"reduced"} /> {hr}
      <div className={"margin-top-8"}></div>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vel risus vitae nulla blandit tincidunt
      non in orci. Phasellus sed augue lectus. Quisque id malesuada sem. Mauris metus ipsum, rhoncus sit amet
      dolor vel, tempor posuere justo. Ut condimentum lorem sed quam aliquet, vitae i
      <GenericTextField fieldName={"Test1"} inputWidth={"reduced"} />
    </>
  );
};

export const TextField = Template.bind({});
TextField.args = {
  // fieldName: string;
  // formInputWide?: boolean;
  // formInputFull?: boolean;
  // error?: boolean;
  // disabled?: boolean;
  //
  // fieldOptions?: TextFieldProps;
  // formContext?: Context<FormContextType<any>>;
  // onValidation?: (fieldName: string, invalid: boolean, value?: string) => void;
  // additionalValidationIsValid?: (value: string) => boolean;
  // visualFilter?: (value: string) => string;
  // valueFilter?: (value: string) => string;
  // handleChange?: (value: string) => void;
  // onChange?: (value: string) => void;
  // validationText?: string;
  // value?: string | number;
  // autoComplete?: string;
  // required?: boolean;
  // numericProps?: {
  //   trimLeadingZeroes?: boolean;
  //   maxLength?: number;
  //   minLength?: number;
  // };
  // ariaLabel?: string;
  // className?: string;
  // allowMasking?: boolean;
  // inputProps?: OutlinedInputProps;
  // type?: HTMLInputTypeAttribute;
};
