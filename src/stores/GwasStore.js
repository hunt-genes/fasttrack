import alt from "../alt";
import Immutable from "immutable";
import ImmutableStore from "alt/utils/ImmutableUtil";
import GwasActions from "../actions/GwasActions";

class GwasStore {
    constructor() {
        this.bindListeners({
            handleUpdateResults: GwasActions.updateResults,
            handleUpdateTraits: GwasActions.updateTraits,
            handleUpdateRequests: GwasActions.updateRequests
        });
        this.state = Immutable.Map({
            results: Immutable.Map({
                different: 0,
                total: 0,
                data: Immutable.List()
            }),
            traits: Immutable.List(),
            requests: Immutable.Map({
                total: 0,
                local: 0
            })
        });
    }

    handleUpdateResults(results) {
        this.setState(this.state.set("results", Immutable.fromJS(results)));
    }

    handleUpdateTraits(traits) {
        this.setState(this.state.set("traits", Immutable.fromJS(traits)));
    }

    handleUpdateRequests(requests) {
        this.setState(this.state.set("requests", Immutable.fromJS(requests)));
    }

    static getResults() {
        return this.getState().get("results");
    }

    static getTraits() {
        return this.getState().get("traits");
    }

    static getRequests() {
        return this.getState().get("requests");
    }
}

export default alt.createStore(ImmutableStore(GwasStore), "GwasStore");
