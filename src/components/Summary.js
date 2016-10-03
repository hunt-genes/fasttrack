import React from 'react';
import { Alert } from 'react-bootstrap';

export default class Summary extends React.Component {
    static propTypes = {
        term: React.PropTypes.string,
        stats: React.PropTypes.object,
        unique: React.PropTypes.bool,
        tromso: React.PropTypes.bool,
        style: React.PropTypes.object,
    }
    render() {
        if (!this.props.term) {
            return (
                <p style={this.props.style}>Use the search field or select from
                    the traits below if you want to see some results</p>);
        }
        if (this.props.term.length < 3) {
            return (
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Alert bsStyle="danger">We need at least three characters</Alert>
                </div>
            );
        }
        const small = (
            <small style={{ fontSize: '1.2rem' }}> for <span
                    style={{ fontStyle: 'italic' }}>P</span> &lt;
                5x10-8</small>
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
                    href={`/search/export?q=${this.props.term}&unique=${this.props.unique}&tromso=${this.props.tromso}`}
                    download
                >
                    Export all
                </a>
                {this.props.stats.unique} unique SNPs in {this.props.stats.total} results {small}
            </p>
        );
    }
}
