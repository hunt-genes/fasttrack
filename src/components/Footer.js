import React from 'react';
import { Link } from 'react-router';
import ExternalLink from './ExternalLink';

export default class Footer extends React.Component {
    static propTypes = {
        requests: React.PropTypes.object,
    }

    render() {
        const statistics = this.props.requests ? <div>{this.props.requests.local} / {this.props.requests.total}</div> : '';
        return (
            <div>
                <hr />
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <footer style={{ fontSize: 11, color: '#aaa', textAlign: 'center', paddingBottom: 50, margin: '0 10px' }}>
                        <Link to="/about">About</Link> this service.<br />
                        GWAS data from <ExternalLink href="https://www.ebi.ac.uk/gwas/docs/downloads">NHGRI-EBI</ExternalLink>, downloaded 2016-02-17.<br />
                        The usual warnings about providing the service AS-IS applies.<br />
                        <ExternalLink href="https://www.ntnu.edu/huntgenes">K.G. Jebsen Center for Genetic Epidemiology</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/ism">Department of public health and general practice (ISM)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/">Norwegian university of science and technology (NTNU)</ExternalLink>
                        <br />
                        {statistics}
                    </footer>
                </div>
            </div>
        );
    }
}
