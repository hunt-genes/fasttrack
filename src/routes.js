import React from 'react';
import Relay from 'react-relay';
import { Route, Redirect, IndexRoute, createRoutes } from 'react-router';
import App from './components/App';
import Variables from './components/Variables';
import VariableList from './components/VariableList';
import VariableForm from './components/VariableForm';
import About from './components/About';

export const queries = {
    viewer: (Component, vars) => {
        return Relay.QL`
    query {
        viewer {
        ${Component.getFragment('viewer', vars)}
        }
    }`;
    }
};

export default createRoutes(
    <Route>
        <Route path="/search" component={App}>
            <Route path=":q" ignoreScrollBehaviour />
        </Route>
        <Route path="/variables" component={Variables}>
            <IndexRoute component={VariableList} />
            <Route path=":term" component={VariableForm} queries={queries} />
        </Route>
        <Route path="/about" component={About} />
        <Redirect from="/" to="/search" />
    </Route>
);
