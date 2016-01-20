import Iso from "iso";
import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router";
import createBrowserHistory from "history/lib/createBrowserHistory";
import routes from "./routes";
import alt from "./alt";
import "es6-promise";

Iso.bootstrap((state, container) => {
    alt.bootstrap(state);
    ReactDOM.render(<Router history={createBrowserHistory()}>{routes}</Router>, container);
});
