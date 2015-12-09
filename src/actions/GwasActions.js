import alt from "../alt";
import axios from "axios";

class GwasActions {
    constructor() {
        this.generateActions("updateResults", "updateTraits", "updateRequests");
    }

    search(query) {
        axios.get("/search/", {params: {q: query}})
        .then((response) => {
            this.actions.updateResults(response.data.results);
            this.actions.updateTraits(response.data.traits);
            if (response.data.requests) {
                this.actions.updateRequests(response.data.requests);
            }
        })
        .catch((response) => {
            console.error(response);
        });
    }
}

export default alt.createActions(GwasActions);
