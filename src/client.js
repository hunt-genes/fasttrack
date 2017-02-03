import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import { match, Router, browserHistory, useRouterHistory } from 'react-router';
import { createHistory } from 'history'
import routes from './routes';
import moment from 'moment';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './scss/stylesheet.scss';


const history = useRouterHistory(createHistory)({
    basename: '/huntgenes/fasttrack/',
});

injectTapEventPlugin();

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('graphql', {
    credentials: 'same-origin',
}));
IsomorphicRelay.injectPreparedData(environment, window.__INITIAL_STATE__);

// Even if this site is written in english, we are mostly used to norwegian formats
moment.locale('nb');

match({ routes, history }, (error, redirectLocation, renderProps) => {
    IsomorphicRouter.prepareInitialRender(environment, renderProps).then(props => {
        ReactDOM.render(<Router {...props} />, document.getElementById('app'));
    });
});
