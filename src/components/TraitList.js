import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import GwasStore from '../stores/GwasStore';
import GwasActions from '../actions/GwasActions';
import { Link } from 'react-router';
import ExternalLink from './ExternalLink';

class TraitList extends React.Component {

    componentDidMount() {
        if (!this.props.traits || !this.props.traits.count()) {
            GwasActions.fetchTraits();
        }
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.traits !== nextProps.traits) {
            return true;
        }
        return false;
    }

    static getStores() {
        return [GwasStore];
    }

    static getPropsFromStores() {
        return {
            traits: GwasStore.getTraits(),
        };
    }

    render() {
        const linkPrefix = this.props.linkPrefix || '/search/?q=';
        return (
            <div>
                {this.props.introduction ?
                    <p style={{ margin: '0 auto', textAlign: 'center' }}>
                        <em>{this.props.introduction}</em>
                    </p>
                    : null
                }
                <ul style={{ WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3, listStyle: 'none', paddingLeft: 0 }}>
                    {this.props.traits ?
                        this.props.traits.map(
                            trait => <li key={trait.get('_id')}>
                                <Link to={`${linkPrefix}${trait.get('_id')}`}>{trait.get('_id')}</Link> <ExternalLink href={trait.get('uri')} />
                            </li>) : ''
                    }
                </ul>
            </div>
        );
    }
}

TraitList.propTypes = {
    traits: React.PropTypes.object,
    linkPrefix: React.PropTypes.string,
};

export default connectToStores(TraitList);
