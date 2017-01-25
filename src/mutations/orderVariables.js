import Relay from 'react-relay';
import moment from 'moment';

export default class OrderVariablesMutation extends Relay.Mutation {
    static fragments = {
        site: () => Relay.QL`
        fragment on Site {
            id
            order {
                id
                createdAt
            }
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {orderVariables}`;
    }

    getVariables() {
        return {
            snps: this.props.snps,
            project: this.props.project,
            email: this.props.email,
            comment: this.props.comment,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on OrderVariablesPayload {
            site { order }
        }`;
    }

    getOptimisticResponse() {
        return {
            site: {
                order: {
                    snps: this.props.snps, // not using this yet. from server, we actually get strings now.
                    project: this.props.project,
                    email: this.props.email,
                    createdAt: moment().toISOString(),
                }
            }
        }
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                site: this.props.site.id,
            }
        }];
    }
}
