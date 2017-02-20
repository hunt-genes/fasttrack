import React from 'react';
import { Link as RouterLink } from 'react-router';
import prefix from '../prefix';

export default class Link extends React.Component {
    static propTypes = {
        children: React.PropTypes.node,
        to: React.PropTypes.string,
    }

    render() {
        const { to, ...props } = this.props;
        return (
            <RouterLink to={`${prefix}/${to}`} {...props}>{this.props.children}</RouterLink>
        );
    }
}
