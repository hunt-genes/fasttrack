import React from "react";
import connectToStores from "alt/utils/connectToStores";
import { Grid, Row, Col } from "react-bootstrap";
import GwasStore from "../stores/GwasStore";
import GwasActions from "../actions/GwasActions";
import { Link } from "react-router";
import ExternalLink from "./ExternalLink";

class TraitList extends React.Component {

    componentDidMount() {
        if (!this.props.traits) {
            GwasActions.fetchTraits();
        }
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.traits !== nextProps.traits) {
            return true;
        }
        return false;
    }

    static getStores() {
        return [GwasStore];
    }

    static getPropsFromStores() {
        return {
            traits: GwasStore.getTraits(),
        };
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col xs={12}>
                        <p style={{ margin: "0 auto", textAlign: "center" }}>
                        <em>Use the search field or select from the traits below if you want to see some results</em>
                            </p>
                        <ul style={{ WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3, listStyle: "none", paddingLeft: 0 }}>
                        {this.props.traits ? this.props.traits.map(trait =>
                                               <li key={trait.get("_id")}>
                                                   <Link to={`/search/?q=${trait.get("_id")}`}>{trait.get("_id")}</Link> <ExternalLink href={trait.get("uri")} />
                                               </li>
                                               ) : ""}
                                           </ul>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

TraitList.propTypes = {
    traits: React.PropTypes.object,
};

export default connectToStores(TraitList);
