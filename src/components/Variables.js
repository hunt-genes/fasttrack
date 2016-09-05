import React from 'react';
import { Grid, Row, Col, PageHeader } from 'react-bootstrap';
import Footer from './Footer';

class Variables extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            //query: this.props.location.query.q || '',
        };
    }

    render() {
        return (
            <section id="main">
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <PageHeader>Order data from HUNT variables</PageHeader>
                            {this.props.children}
                        </Col>
                    </Row>
                </Grid>
                <Footer />
            </section>
        );
    }
}

export default Variables;
