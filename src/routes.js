import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, createRoutes } from 'react-router';
import Search from './components/Search';
import About from './components/About';
import Order from './components/Order';
import prefix from './prefix';

export const queries = {
    viewer: (Component, vars) => {
        return Relay.QL`
        query {
            viewer {
                ${Component.getFragment('viewer', vars)}
            }
        }`;
    },
    site: () => {
        return Relay.QL`query { site  }`;
    },
};

export default createRoutes(<Route path={prefix}>
    <IndexRoute component={Search} queries={queries} />
    <Route path="about" component={About} />
    <Route path="order" component={Order} queries={queries} />
</Route>);
