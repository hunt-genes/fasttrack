import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Relay from 'react-relay';
import { Link } from 'react-router';
import ExternalLink from './ExternalLink';

class TraitList extends React.Component {
    static propTypes = {
        introduction: React.PropTypes.string,
        linkPrefix: React.PropTypes.string,
        viewer: React.PropTypes.object,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    render() {
        const linkPrefix = this.props.linkPrefix || '/search/?q=';
        return (
            <Grid>
                <Row>
                    <Col xs={12}>
                        {this.props.introduction ?
                            <p style={{ margin: '0 auto', textAlign: 'center' }}>
                                <em>{this.props.introduction}</em>
                            </p>
                            : null
                        }
                        <ul style={{ WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3, listStyle: 'none', paddingLeft: 0 }}>
                            {this.props.viewer.traits.map(trait => (
                                <li key={trait.id}>
                                    <Link to={`${linkPrefix}${trait.id}`}>{trait.id}</Link> <ExternalLink href={trait.uri} />
                                </li>))
                            }
                        </ul>
                    </Col>
                </Row>
            </Grid>
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
