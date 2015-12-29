import React from "react";
import { Grid, Row, Col } from "react-bootstrap";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import ExternalLink from "./ExternalLink";

class Footer extends React.Component {

    componentDidMount() {
        if (!this.props.requests) {
            GwasActions.fetchRequests();
        }
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.requests !== nextProps.requests) {
            return true;
        }
        return false;
    }

    static getStores() {
        return [GwasStore];
    }

    static getPropsFromStores() {
        return {
            requests: GwasStore.getRequests(),
        };
    }

    render() {
        const statistics = this.props.requests ? <div>{this.props.requests.get("local")} / {this.props.requests.get("total")}</div> : "";
        return (
            <div>
                <hr />
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <footer style={{ fontSize: 11, color: "#aaa", textAlign: "center", paddingBottom: 50 }}>
                                GWAS data from <ExternalLink href="https://www.ebi.ac.uk/gwas/docs/downloads">NHGRI-EBI</ExternalLink><br />
                                The usual warnings about providing the service AS-IS applies.<br />
                                <ExternalLink href="http://www.ntnu.no/ism/epicenter/home">Human genetic epidemiology group (HGE)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/ism">Department of public health and general practice (ISM)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/">Norwegian university of science and technology (NTNU)</ExternalLink>
                                <br />
                                {statistics}
                            </footer>
                        </Col>
                    </Row>
                </Grid>
                </div>
        );
    }
}
Footer.propTypes = {
    requests: React.PropTypes.object,
};

export default connectToStores(Footer);
