import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import theme from '../theme';

export default class Summary extends React.Component {
    static propTypes = {
        term: React.PropTypes.string,
        stats: React.PropTypes.object,
        unique: React.PropTypes.bool,
        tromso: React.PropTypes.bool,
        hunt: React.PropTypes.bool,
        style: React.PropTypes.object,
        loading: React.PropTypes.bool,
        toggleOrdering: React.PropTypes.func,
    }

    toggleOrdering = () => {
        this.props.toggleOrdering();
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
                    <div
                        style={{
                            backgroundColor: theme.palette.accent1Color,
                            color: theme.palette.alternateTextColor,
                            paddingLeft: theme.spacing.desktopGutterLess,
                            paddingRight: theme.spacing.desktopGutterLess,
                            paddingTop: theme.spacing.desktopGutterMini,
                            paddingBottom: theme.spacing.desktopGutterMini,
                            margin: theme.spacing.desktopGutter,
                        }}
                    >
                        We need at least three characters
                    </div>
                </div>
            );
        }

        const term = this.props.term || '';
        const unique = this.props.unique;
        const hunt = this.props.hunt;
        const tromso = this.props.tromso;
        const small = (
            <small
                style={{ fontSize: '1.2rem' }}
            > for <span style={{ fontStyle: 'italic' }}>P</span> &lt; 5x10-8</small>
        );

        return (
            <div>
            <div style={this.props.style}>
                { this.props.ordering
                    ? <RaisedButton label="Order variables" onTouchTap={this.toggleOrdering} />
                    : <RaisedButton label="Order variables" onTouchTap={this.toggleOrdering} />
                }
            </div>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div
                    style={{
                        marginTop: theme.spacing.desktopGutter,
                        marginBottom: theme.spacing.desktopGutter,
                        paddingLeft: 10,
                        fontSize: '1.2rem',
                    }}
                >
                    <RaisedButton
                        style={{
                            display: 'block',
                            float: 'right',
                            marginRight: 10,
                        }}
                        href={`/search/export?q=${term}&unique=${unique}&tromso=${tromso}&hunt=${hunt}`}
                        download
                        label="Export .tsv"
                    />
                    {this.props.stats.unique} unique SNPs in {this.props.stats.total} studies {small}
                </div>
            </div>
            </div>
        );
    }
}
