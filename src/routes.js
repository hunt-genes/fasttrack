import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, Redirect, createRoutes } from 'react-router';
import Search from './components/Search';
import About from './components/About';
import Order from './components/Order';

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

export default createRoutes(
    <Route path="/">
        <IndexRoute component={Search} queries={queries} />
        <Route path="about" component={About} />
        <Route path="order" component={Order} queries={queries} />
        <Redirect from="search" to=".." />
    </Route>
);
