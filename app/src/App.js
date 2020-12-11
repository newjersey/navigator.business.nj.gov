import React from 'react';
import Form from '@rjsf/core';
import schema from './form.json';

const log = (type) => console.log.bind(console, type);

const sections = Object.keys(schema.properties);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 0 };
  }

  componentDidMount() {
    document.querySelectorAll('#root > .field-object > fieldset')[0].className = 'active';
  }

  componentDidUpdate() {
    document.querySelectorAll('#root > .field-object > fieldset').forEach(function(el) {
      el.className = '';
    });
    document.querySelector('#root_' + sections[this.state.page]).className = 'active';
  }

  onSubmit(submit, e) {
    localStorage.setItem('formData', JSON.stringify(submit.formData));
    if (this.state.page+1 < sections.length) {
      this.setState({
        page: this.state.page + 1
      });
    }
  }

  onBack(submit, e) {
    localStorage.setItem('formData', JSON.stringify(submit.formData));
    if (this.state.page+1 > 0) {
      this.setState({
        page: this.state.page - 1
      });
    }
    return false;
  }


  render() {
    let data = localStorage.getItem('formData');
    let user = localStorage.getItem('gotrue.user')
    data = (data !== 'undefined') ? JSON.parse(data) : {};
    user = (user !== 'undefined') ? JSON.parse(user) : {};
    if (user && user.email) {
      data.user = data.user || {};
      data.user.email = user.email;
    }
    return (
      <Form schema={schema}
            className={`page-${this.state.page}`}
            onChange={log("changed")}
            onSubmit={this.onSubmit.bind(this)}
            formData={data}
            onError={log("errors")}
      >
        {this.state.page > 0 &&
          <a className="btn btn-default" onClick={this.onBack.bind(this)}>Back</a>
        }
        <button type="submit" className="btn btn-primary">Next</button>
      </Form>
    );
  }
}

export default App;
