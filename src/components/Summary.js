import React from 'react';
import { Alert } from 'react-bootstrap';

export default class Summary extends React.Component {
    static propTypes = {
        term: React.PropTypes.string,
        stats: React.PropTypes.object,
        unique: React.PropTypes.bool,
        tromso: React.PropTypes.bool,
        hunt: React.PropTypes.bool,
        style: React.PropTypes.object,
        loading: React.PropTypes.bool,
    }
    render() {
        if (this.props.loading) {
            return (
                <div className="loader">
                    <div></div><div></div><div></div><div></div><div></div><div></div>
                </div>
            );
        }
        if (this.props.term && this.props.term.length < 3) {
            return (
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Alert bsStyle="danger">We need at least three characters</Alert>
                </div>
            );
        }

        const term = this.props.term;
        const unique = this.props.unique;
        const hunt = this.props.hunt;
        const tromso = this.props.tromso;
        const small = (
            <small
                style={{ fontSize: '1.2rem' }}
            > for <span style={{ fontStyle: 'italic' }}>P</span> &lt; 5x10-8</small>
        );

        return (
            <p style={this.props.style}>
                <a
                    style={{
                        display: 'block',
                        float: 'right',
                        marginRight: 10,
                    }}
                    className="btn"
                    href={`/search/export?q=${term}&unique=${unique}&tromso=${tromso}&hunt=${hunt}`}
                    download
                >
                    Export all
                </a>
                {this.props.stats.unique} unique SNPs in {this.props.stats.total} results {small}
            </p>
        );
    }
}
