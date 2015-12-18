import React from "react";
import { Route, Redirect } from "react-router";
import App from "./components/App";

const routes = (
    <Route>
        <Route path="/search" component={App}>
            <Route path=":q" ignoreScrollBehaviour />
        </Route>
        <Redirect from="/" to="/search" />
    </Route>
);

module.exports = routes;
