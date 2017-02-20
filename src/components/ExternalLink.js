import IconOut from 'material-ui/svg-icons/navigation/arrow-forward';
import React from 'react';
import theme from '../theme';

export default class ExternalLink extends React.Component {
    static propTypes = {
        href: React.PropTypes.string,
        children: React.PropTypes.string,
    }

    render() {
        if (this.props.children) {
            return <a href={this.props.href} target="_blank" rel="noopener noreferrer">{this.props.children}</a>;
        }
        return (
            <a href={this.props.href} target="_blank" rel="noopener noreferrer">
                <IconOut
                    color={theme.palette.linkColor}
                    style={{ width: '1rem', height: '1rem', marginBottom: '-0.2rem' }}
                />
            </a>
        );
    }
}
