import React from 'react';
import Relay from 'react-relay';
import { Route, Redirect, IndexRoute, createRoutes } from 'react-router';
import Search from './components/Search';
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
    },
};

export default createRoutes(
    <Route>
        <Route path="/search" component={Search} queries={queries} />
        <Route path="/variables" component={Variables}>
            <IndexRoute component={VariableList} queries={queries} />
            <Route path=":term" component={VariableForm} queries={queries} />
        </Route>
        <Route path="/about" component={About} />
        <Redirect from="/" to="/search" />
    </Route>
);
