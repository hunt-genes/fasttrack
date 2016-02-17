import React from "react";
import { Grid, Row, Col } from "react-bootstrap";
import ExternalLink from "./ExternalLink";

class Footer extends React.Component {
    render() {
        return (
            <Grid id="about">
                <Row>
                    <Col xs={12}>
                        <h1>About</h1>
                        <h2>Data sources</h2>
                        <h3>NHGRI-EBI</h3>
                        <div>
                            <div className="cite-names">Burdett T (EBI), Hall PN (NHGRI), Hasting E (EBI) Hindorff LA (NHGRI), Junkins HA (NHGRI), Klemm AK (NHGRI), MacArthur J (EBI), Manolio TA (NHGRI), Morales J (EBI), Parkinson H (EBI) and Welter D (EBI).</div>
                            The NHGRI-EBI Catalog of published genome-wide association studies.<br />
                            Available at: <a href="https://www.ebi.ac.uk/gwas">www.ebi.ac.uk/gwas</a>. Accessed 2015-11-18, version v1.0.1.
                        </div>
                        <h3>Tromsøundersøkelsen</h3>
                        <p>Imputation data from <ExternalLink href="https://uit.no/forskning/forskningsgrupper/gruppe?p_document_id=367276">Tromsøundersøkelsen</ExternalLink> and the <ExternalLink href="https://www.ntnu.edu/huntgenes">K.G. Jebsen Center for Genetic Epidemiology</ExternalLink> (Huntgenes) group at <ExternalLink href="https://www.ntnu.edu/">NTNU</ExternalLink>.</p>
                        <h2>Warnings and warranty</h2>
                        <p>The usual warnings about providing the service AS-IS applies.</p>
                        <p>You should depend on the <ExternalLink href="https://www.ebi.ac.uk/gwas">original GWAS service from NHGRI-EBI</ExternalLink> for research.</p>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export default Footer;
