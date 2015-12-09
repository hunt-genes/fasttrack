import alt from "../alt";
import axios from "axios";

class GwasActions {
    constructor() {
        this.generateActions('updateResults', 'updateTraits', 'updateDifferent', 'updateTotal', 'updateTotalRequests');
    }

    search(query) {
        axios.get("/search/", {params: {q: query}})
        .then((response) => {
            this.actions.updateResults(response.data.results);
            this.actions.updateTraits(response.data.traits);
            this.actions.updateDifferent(response.data.different);
            this.actions.updateTotal(response.data.total);
            if (response.data.totalRequests) {
                this.actions.updateTotalRequests(response.data.totalRequests);
            }
        })
        .catch((response) => {
            console.error(response);
        });
    }
}

export default alt.createActions(GwasActions);
