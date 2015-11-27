import alt from "../alt";
import Immutable from "immutable";
import ImmutableStore from "alt/utils/ImmutableUtil";
import GwasActions from "../actions/GwasActions";

class GwasStore {
    constructor() {
        this.bindListeners({
            handleUpdateResults: GwasActions.updateResults,
            handleUpdateTraits: GwasActions.updateTraits,
            handleUpdateCount: GwasActions.updateCount
        });
        this.state = Immutable.Map({
            results: Immutable.List(),
            traits: Immutable.List(),
            count: 0,
            query: ""
        });
    }

    handleUpdateResults(results) {
        this.setState(this.state.set("results", Immutable.fromJS(results)));
    }

    handleUpdateTraits(traits) {
        this.setState(this.state.set("traits", Immutable.fromJS(traits)));
    }

    handleUpdateCount(count) {
        this.setState(this.state.set("count", count));
    }

    static getResults() {
        return this.getState().get("results");
    }

    static getTraits() {
        return this.getState().get("traits");
    }

    static getCount() {
        return this.getState().get("count");
    }
}

export default alt.createStore(ImmutableStore(GwasStore), "GwasStore");
