import Form from '@rjsf/core';
import schema from './form.json';

const log = (type) => console.log.bind(console, type);

function App() {
  return (
  <Form schema={schema}
        onChange={log("changed")}
        onSubmit={log("submitted")}
        onError={log("errors")} />
  );
}

export default App;
