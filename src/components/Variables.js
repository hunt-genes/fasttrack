import React from "react";
import connectToStores from "alt/utils/connectToStores";
import { Input, Button, Table, Alert, Grid, Row, Col, Image, PageHeader } from "react-bootstrap";
import TraitList from "./TraitList";
import Footer from "./Footer";
import GwasStore from "../stores/GwasStore";
import GwasActions from "../actions/GwasActions";

class Variables extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.location.query.q || "",
        }
    }
    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {
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

export default connectToStores(Variables);
