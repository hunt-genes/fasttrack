import React from 'react';
import ExternalLink from './ExternalLink';
import Link from './Link';

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
                        <Link to="about">About</Link> this service.<br />
                        GWAS data from <ExternalLink href="https://www.ebi.ac.uk/gwas/">NHGRI-EBI</ExternalLink>, downloaded 2016-10-12.<br />
                        The usual warnings about providing the service AS-IS applies.<br />
                        <ExternalLink href="https://www.ntnu.edu/huntgenes">K.G. Jebsen Center for Genetic Epidemiology</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/ism">Department of Public Health and Nursing (ISM)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/">NTNU - Norwegian University of Science and Technology</ExternalLink>
                        <br />
                        {statistics}
                    </footer>
                </div>
            </div>
        );
    }
}
