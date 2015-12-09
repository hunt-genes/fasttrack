var ReactRouter = require("react-router");
// import {Route, IndexRoute} from "react-router";
var Route = ReactRouter.Route;
var Redirect = ReactRouter.Redirect;
var React = require("react");
var App = require("./components/App");

var routes = (
    <Route>
        <Route path="/search" component={App}>
            <Route path=":q" ignoreScrollBehaviour />
        </Route>
        <Redirect from="/" to="/search" />
    </Route>
);

module.exports = routes;
