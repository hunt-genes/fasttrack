var ReactRouter = require("react-router");
//import {Route, IndexRoute} from "react-router";
var Route = ReactRouter.Route;
var React = require("react");
var App = require("./components/App");
var Search = require("./components/Search");

var routes = (
    <Route path="/search" component={App}>
        <Route path=":q" />
    </Route>
);

module.exports = routes;
