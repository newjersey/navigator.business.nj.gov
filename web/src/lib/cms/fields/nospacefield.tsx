import React, { Component, createRef, ReactElement } from "react";

type NoSpaceProps = {
  onChange: (e: string) => void;
  entry?: object;
  forID?: string;
  default?: string;
  value?: string;
  classNameWrapper: string;
  setActiveStyle: () => void;
  setInactiveStyle: () => void;
};
type NoSpaceState = {
  entry_object: object;
  value: string;
  _sel: number | null;
};

class NoSpaceControl extends Component<NoSpaceProps, NoSpaceState> {
  private el = createRef<HTMLInputElement>();

  constructor(props: NoSpaceProps) {
    super(props);
    const entry_object = JSON.parse(JSON.stringify(this.props.entry));
    this.state = {
      entry_object,
      value: entry_object.slug,
      _sel: 0,
    };
  }

  isValid = (): { error?: { message?: string } } => {
    if (this.props.value?.includes(" ")) {
      return { error: { message: "error: cannot contain whitespaces!" } };
    } else {
      return {};
    }
  };

  // NOTE: This prevents the cursor from jumping to the end of the text for
  // nested inputs. In other words, this is not an issue on top-level text
  // fields such as the `title` of a collection post. However, it becomes an
  // issue on fields nested within other components, namely widgets nested
  // within a `markdown` widget. For example, the alt text on a block image
  // within markdown.
  // SEE: https://github.com/netlify/netlify-cms/issues/4539
  // // SEE: https://github.com/netlify/netlify-cms/issues/3578
  componentDidUpdate(): void {
    if (this.el.current && this.el.current.selectionStart !== this.state._sel) {
      this.el.current.setSelectionRange(this.state._sel, this.state._sel);
    }
  }

  handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.setState({ _sel: e.target.selectionStart });
    this.props.onChange(e.target.value.trim());
  };

  render(): ReactElement {
    const { forID, value, classNameWrapper, setActiveStyle, setInactiveStyle } = this.props;
    return (
      <input
        ref={this.el}
        type="text"
        id={forID}
        className={classNameWrapper}
        value={value ?? this.state.value}
        onChange={this.handleChange}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    );
  }
}

export { NoSpaceControl };
