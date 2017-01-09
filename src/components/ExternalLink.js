import IconOut from 'material-ui/svg-icons/navigation/arrow-forward';
import React from 'react';
import theme from '../theme';

const ExternalLink = props => {
    if (props.children) {
        return <a href={props.href} target="_blank">{props.children}</a>;
    }
    return (
        <a href={props.href} target="_blank">
            <IconOut
                color={theme.palette.linkColor}
                style={{ width: '1rem', height: '1rem', marginBottom: '-0.2rem' }}
            />
        </a>
    );
};

ExternalLink.propTypes = {
    href: React.PropTypes.string,
    children: React.PropTypes.string,
};

export default ExternalLink;
