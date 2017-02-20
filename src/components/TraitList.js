import React from 'react';
import Relay from 'react-relay';
import ExternalLink from './ExternalLink';
import Link from './Link';

class TraitList extends React.Component {
    static propTypes = {
        introduction: React.PropTypes.string,
        viewer: React.PropTypes.object,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    render() {
        return (
            <div style={{ padding: '0 15px' }}>
                {this.props.introduction ?
                    <p style={{ margin: '0 auto', textAlign: 'center' }}>
                        <em>{this.props.introduction}</em>
                    </p>
                    : null
                }
                <ul style={{ WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3, listStyle: 'none', paddingLeft: 0 }}>
                    {this.props.viewer.traits.map(trait => (
                        <li key={trait.id}>
                            <Link to={`?q=${trait.id}`}>{trait.id}</Link> <ExternalLink href={trait.uri} />
                        </li>))
                    }
                </ul>
            </div>
        );
    }
}

export default Relay.createContainer(TraitList, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            traits {
                id,
                uri
            }
        }`,
    },
});
