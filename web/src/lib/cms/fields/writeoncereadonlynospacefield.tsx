import React, { Component, createRef, ReactElement } from "react";

type WriteOnceReadOnlyNoSpaceProps = {
  onChange: (e: string) => void;
  entry?: object;
  forID?: string;
  default?: string;
  value?: string;
  classNameWrapper: string;
  setActiveStyle: () => void;
  setInactiveStyle: () => void;
};
type WriteOnceReadOnlyNoSpaceState = {
  entry_object: object;
  value: string;
  _sel: number | null;
};

class WriteOnceReadOnlyNoSpaceControl extends Component<
  WriteOnceReadOnlyNoSpaceProps,
  WriteOnceReadOnlyNoSpaceState
> {
  private el = createRef<HTMLInputElement>();

  constructor(props: WriteOnceReadOnlyNoSpaceProps) {
    super(props);
    const entry_object = JSON.parse(JSON.stringify(this.props.entry));
    this.state = {
      entry_object,
      value: entry_object.slug,
      _sel: 0,
    };
  }

  isValid = (): boolean => {
    return true;
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
    this.props.onChange(e.target.value.trim().toLowerCase());
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
        disabled={!!this.state.value} // This is the key line that makes this unique and uneditable in the CMS specifically
        onChange={this.handleChange}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    );
  }
}

export { WriteOnceReadOnlyNoSpaceControl };
