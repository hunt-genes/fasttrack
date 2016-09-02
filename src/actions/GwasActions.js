import alt from '../alt';
import axios from 'axios';

class GwasActions {
    constructor() {
        this.generateActions('updateResults', 'updateTraits', 'updateRequests');
    }

    search(query, tromso = 0, unique = 0) {
        axios.get('/search/', { params: { q: query, tromso, unique } })
        .then((response) => {
            this.actions.updateResults(response.data.results);
        })
        .catch((response) => {
            console.error(response);
        });
    }

    fetchTraits() {
        axios.get('/traits')
        .then((response) => {
            this.actions.updateTraits(response.data.traits);
        });
    }

    fetchRequests() {
        axios.get('/requests')
        .then((response) => {
            this.actions.updateRequests(response.data.requests);
        });
    }
}

export default alt.createActions(GwasActions);
