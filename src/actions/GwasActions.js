import alt from "../alt";
import axios from "axios";

class GwasActions {
    constructor() {
        this.generateActions('updateResults', 'updateTraits', 'updateCount');
    }

    search(query) {
        axios.get("/search/", {params: {q: query}})
        .then((response) => {
            this.actions.updateResults(response.data.results);
            this.actions.updateTraits(response.data.traits);
            this.actions.updateCount(response.data.count);
        })
        .catch((response) => {
            console.error(response);
        });
    }
}

export default alt.createActions(GwasActions);
