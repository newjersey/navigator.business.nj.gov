/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import React from "react";

class SlugControl extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    entry: PropTypes.object,
    forID: PropTypes.string,
    default: PropTypes.string,
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.entry_object = JSON.parse(JSON.stringify(this.props.entry));
    // this.props.onChange(this.entry_object.slug);
    this.state = {
      value: this.entry_object.slug,
    };
  }

  isValid = () => {
    return true;
  };
  // The selection to maintain for the input element
  _sel = 0;

  // The input element ref
  _el = null;

  // NOTE: This prevents the cursor from jumping to the end of the text for
  // nested inputs. In other words, this is not an issue on top-level text
  // fields such as the `title` of a collection post. However, it becomes an
  // issue on fields nested within other components, namely widgets nested
  // within a `markdown` widget. For example, the alt text on a block image
  // within markdown.
  // SEE: https://github.com/netlify/netlify-cms/issues/4539
  // SEE: https://github.com/netlify/netlify-cms/issues/3578
  componentDidUpdate() {
    if (this._el && this._el.selectionStart !== this._sel) {
      this._el.setSelectionRange(this._sel, this._sel);
    }
  }

  handleChange = (e) => {
    this._sel = e.target.selectionStart;
    this.props.onChange(e.target.value);
  };

  render() {
    const { forID, value, classNameWrapper, setActiveStyle, setInactiveStyle } = this.props;
    return (
      <input
        ref={(el) => {
          this._el = el;
        }}
        type="text"
        id={forID}
        className={classNameWrapper}
        value={value ?? this.state.value}
        disabled={!!this.entry_object.slug}
        onChange={this.handleChange}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    );
  }
}

export { SlugControl };
