import React from "react";
import { Route, Redirect, IndexRoute } from "react-router";
import App from "./components/App";
import Variables from "./components/Variables";
import VariableList from "./components/VariableList";
import VariableForm from "./components/VariableForm";
import About from "./components/About";

const routes = (
    <Route>
        <Route path="/search" component={App}>
            <Route path=":q" ignoreScrollBehaviour />
        </Route>
        <Route path="/variables" component={Variables} >
            <IndexRoute component={VariableList} />
            <Route path=":q" component={VariableForm} />
        </Route>
        <Route path="/about" component={About} />
        <Redirect from="/" to="/search" />
    </Route>
);

module.exports = routes;
