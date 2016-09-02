import React from 'react';

const ExternalLink = props => {
    if (props.children) {
        return <a href={props.href} target="_blank">{props.children}</a>;
    }
    return <a href={props.href} target="_blank"><i className="fa fa-external-link"></i></a>;
};

ExternalLink.propTypes = {
    href: React.PropTypes.string,
    children: React.PropTypes.string,
};

export default ExternalLink;
