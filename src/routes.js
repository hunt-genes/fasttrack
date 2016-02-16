import React from "react";
import { Route, Redirect } from "react-router";
import App from "./components/App";
import About from "./components/About";

const routes = (
    <Route>
        <Route path="/search" component={App}>
            <Route path=":q" ignoreScrollBehaviour />
        </Route>
        <Route path="/about" component={About} />
        <Redirect from="/" to="/search" />
    </Route>
);

module.exports = routes;
