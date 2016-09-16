import React from 'react';
import Relay from 'react-relay';
import TraitList from './TraitList';

class VariableList extends React.Component {
    render() {
        return (
            <div>
                <p>Choose trait to select variables for from the list below</p>
                <TraitList linkPrefix="/variables/" viewer={this.props.viewer} />
            </div>
        );
    }
}
export default Relay.createContainer(VariableList, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            traits {
                id,
            }
            ${TraitList.getFragment('viewer')}
        }`,
    },
});
