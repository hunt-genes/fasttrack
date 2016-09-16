import React from 'react';
import ReactDOM from 'react-dom';
import { FormGroup, InputGroup, FormControl, HelpBlock, Button, Table, Alert, Grid, Row, Col, Image } from 'react-bootstrap';
import Relay from 'react-relay';
import { Link } from 'react-router';

import Footer from './Footer';
import SearchResults from './SearchResults';
import TraitList from './TraitList';

const pageSize = 5;

class Search extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
    }

    state = {
        term: this.props.location.query.q,
    }

    componentDidMount() {
        this.props.relay.setVariables({
            term: this.props.location.query.q,
        });
    }

    componentWillReceiveProps(nextProps) {
        const location = this.props.location;
        const newLocation = nextProps.location;
        const q = location.query.q;
        const newQ = newLocation.query.q;
        /*
        const tromso = location.query.tromso === 'true';
        const newTromso = newLocation.query.tromso === 'true';
        const unique = location.query.unique === 'true';
        const newUnique = newLocation.query.unique === 'true';
        */
        if (q !== newQ /*|| tromso !== newTromso || unique !== newUnique*/) {
            this.props.relay.setVariables({
                term: newQ || '',
                //tromso: newTromso || false,
                //unique: newUnique || false,
            });
        }
    }

    onSearch = (event) => {
        event.preventDefault();
        const value = ReactDOM.findDOMNode(this.refs.query).value;
        this.context.router.push({ query: { q: value } });
    }

    onClear = (event) => {
        event.preventDefault();
        this.context.router.push({ query: { q: '' } });
    }

    onChange = (event) => {
        this.setState({
            term: ReactDOM.findDOMNode(this.refs.query).value,
        });
    }

    render() {
        const buttons = <div><Button type="submit" bsStyle="primary">Search</Button><Button type="reset" bsStyle="link">Clear</Button></div>;
        const examples = <p>Examples: <Link to="/search/?q=diabetes">diabetes</Link>, <Link to="/search/?q=rs3820706">rs3820706</Link>, <Link to="/search/?q=Chung S">Chung S</Link>, <Link to="/search/?q=2q23.3">2q23.3</Link>, <Link to="/search/?q=CACNB4">CACNB4</Link></p>;
        const help = (
            <Row>
                <Col xs={9}>
                    {examples}
                </Col>
                <Col xs={3} className="compact" />
            </Row>
        );
        return (
            <section>
                <Grid>
                    <Row>
                        <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
                            <form onSubmit={this.onSearch} onReset={this.onClear}>
                                <Row>
                                    <Col sm={1}>
                                        <Image
                                            className="hidden-xs"
                                            responsive
                                            src="/img/logo2_ntnu_u-slagord.jpg"
                                            style={{ marginTop: 28 }}
                                        />
                                    </Col>
                                    <Col sm={11}>
                                        <h1>HUNT fast-track GWAS catalog search</h1>
                                        <FormGroup controlId="query">
                                            <InputGroup>
                                                <FormControl type="text" ref="query" placeholder="Search" value={this.state.term} onChange={this.onChange} />
                                                <InputGroup.Button>
                                                    <Button type="submit" bsStyle="primary">Search</Button>
                                                </InputGroup.Button>
                                                <InputGroup.Button>
                                                    <Button type="reset" bsStyle="link">Clear</Button>
                                                </InputGroup.Button>
                                            </InputGroup>
                                            {help && <HelpBlock>{help}</HelpBlock>}
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </form>
                        </Col>
                    </Row>
                </Grid>
                {this.props.viewer.results.edges.length > 0 ? <SearchResults results={this.props.viewer.results} />: <TraitList viewer={this.props.viewer}/>}
                <Footer />
            </section>
        );
    }
}

export default Relay.createContainer(Search, {
    initialVariables: {
        term: '',
        pageSize,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            results(first: $pageSize, term: $term)
            {
                edges {
                    node {
                        id
                        SNP_ID_CURRENT
                        SNPS
                        DATE
                        MAPPED_GENE
                        MAPPED_TRAIT
                        or_or_beta
                        PUBMEDID
                        REGION
                        CHR_ID
                        CHR_POS
                        CONTEXT
                        p_value
                        p_value_text
                        p95_ci
                        date_added_to_catalog
                        first_author
                        JOURNAL
                        imputed {
                            tromso {
                                Genotyped
                            }
                        }
                    }
                },
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            count(
                term: $term
            )
            ${TraitList.getFragment('viewer')}
        }`,
    },
});
