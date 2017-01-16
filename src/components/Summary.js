import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import { Link } from 'react-router';
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
        selecting: React.PropTypes.bool,
        toggleSelection: React.PropTypes.func,
        cancelSelection: React.PropTypes.func,
    }

    toggleSelection = () => {
        this.props.toggleSelection();
    }

    cancelSelection = () => {
        this.props.cancelSelection();
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
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Toolbar style={{ backgroundColor: theme.palette.canvasColor }}>
                    <ToolbarGroup firstChild>
                        <div
                            style={{
                                marginTop: theme.spacing.desktopGutter,
                                marginBottom: theme.spacing.desktopGutter,
                                paddingLeft: 10,
                                fontSize: '1.2rem',
                            }}
                        >
                            {this.props.stats.unique} unique SNPs in {this.props.stats.total} studies {small}
                        </div>
                    </ToolbarGroup>
                    <ToolbarGroup lastChild>
                        <div style={{ padding: 12 }}>
                            {this.props.selecting
                                ? <Link to="/order" ><RaisedButton label="Make order" primary /></Link>
                                : null
                            }
                            {this.props.selecting
                                ? <RaisedButton label="Cancel" onClick={this.cancelSelection} />
                                : null
                            }
                        </div>
                    </ToolbarGroup>
                </Toolbar>
            </div>
        );
    }
}
