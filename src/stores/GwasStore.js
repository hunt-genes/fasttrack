import alt from "../alt";
import Immutable from "immutable";
import ImmutableStore from "alt/utils/ImmutableUtil";
import GwasActions from "../actions/GwasActions";

class GwasStore {
    constructor() {
        this.bindListeners({
            handleUpdateResults: GwasActions.updateResults,
            handleUpdateCount: GwasActions.updateCount
        });
        this.state = Immutable.Map({
            results: Immutable.List(),
            count: 0,
            query: ""
        });
    }

    handleUpdateResults(results) {
        console.log("res", results);
        this.setState(this.state.set("results", Immutable.fromJS(results)));
    }

    handleUpdateCount(count) {
        this.setState(this.state.set("count", count));
    }

    static getResults() {
        return this.getState().get("results");
    }

    static getCount() {
        return this.getState().get("count");
    }
}

export default alt.createStore(ImmutableStore(GwasStore), "GwasStore");
