import alt from "../alt";
import Immutable from "immutable";
import ImmutableStore from "alt/utils/ImmutableUtil";
import GwasActions from "../actions/GwasActions";

class GwasStore {
    constructor() {
        this.bindListeners({
            handleUpdateResults: GwasActions.updateResults,
            handleUpdateTraits: GwasActions.updateTraits,
            handleUpdateDifferent: GwasActions.updateDifferent,
            handleUpdateTotal: GwasActions.updateTotal,
            handleUpdateTotalRequests: GwasActions.updateTotalRequests
        });
        this.state = Immutable.Map({
            results: Immutable.List(),
            traits: Immutable.List(),
            different: 0,
            total: 0,
            query: ""
        });
    }

    handleUpdateResults(results) {
        this.setState(this.state.set("results", Immutable.fromJS(results)));
    }

    handleUpdateTraits(traits) {
        this.setState(this.state.set("traits", Immutable.fromJS(traits)));
    }

    handleUpdateDifferent(different) {
        this.setState(this.state.set("different", different));
    }

    handleUpdateTotal(total) {
        this.setState(this.state.set("total", total));
    }

    handleUpdateTotalRequests(requests) {
        this.setState(this.state.set("totalRequests", totalRequests));
    }

    static getResults() {
        return this.getState().get("results");
    }

    static getTraits() {
        return this.getState().get("traits");
    }

    static getDifferent() {
        return this.getState().get("different");
    }

    static getTotal() {
        return this.getState().get("total");
    }

    static getTotalRequests() {
        return this.getState().get("totalRequests");
    }
}

export default alt.createStore(ImmutableStore(GwasStore), "GwasStore");
