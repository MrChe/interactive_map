import ReactDOM from 'react-dom';
import * as React from 'react';
import { AppContainer } from 'react-hot-loader';
import App from 'containers/App';
import './theme/main.scss';

const renderApp = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

renderApp(App);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('containers/App', () => renderApp(App));
}
