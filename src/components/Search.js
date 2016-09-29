import React from 'react';
import ReactDOM from 'react-dom';
import { FormGroup, InputGroup, FormControl, HelpBlock, Button, Checkbox, Alert, Grid, Row, Col, Image } from 'react-bootstrap';
import Relay from 'react-relay';
import { Link } from 'react-router';

import Footer from './Footer';
import SearchResults from './SearchResults';
import TraitList from './TraitList';

const pageSize = 50;

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
            unique: this.props.location.query.unique === 'true',
            tromso: this.props.location.query.tromso === 'true',
        });
    }

    componentWillReceiveProps(nextProps) {
        // parsing of booleans from checkboxes has gotten completely
        // impossible, so we handle them in directly in the handler function,
        // by setting both the relay variable and updating the query param.
        const location = this.props.location;
        const newLocation = nextProps.location;
        const q = location.query.q;
        const newQ = newLocation.query.q;
        if (q !== newQ) {
            this.props.relay.setVariables({
                term: newQ || '',
            });
            this.setState({
                term: newQ || '',
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

    onUniqueChange = () => {
        const unique = !this.props.relay.variables.unique;
        const query = this.props.location.query;
        query.unique = unique;
        this.context.router.push({ query });
        this.props.relay.setVariables({ unique });
    }

    onTromsoChange = () => {
        const tromso = !this.props.relay.variables.tromso;
        const query = this.props.location.query;
        query.tromso = tromso;
        this.context.router.push({ query });
        this.props.relay.setVariables({ tromso });
    }

    loadMore = () => {
        const results = this.props.viewer.results;
        this.props.relay.setVariables({
            resultsToShow: results.edges.length + pageSize,
        });
    }

    render() {
        const buttons = <div><Button type="submit" bsStyle="primary">Search</Button><Button type="reset" bsStyle="link">Clear</Button></div>;
        const examples = <p>Examples: <Link to="/search/?q=diabetes">diabetes</Link>, <Link to="/search/?q=rs3820706">rs3820706</Link>, <Link to="/search/?q=Chung S">Chung S</Link>, <Link to="/search/?q=2q23.3">2q23.3</Link>, <Link to="/search/?q=CACNB4">CACNB4</Link></p>;
        const help = (
            <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: '1' }}>
                    {examples}
                </div>
                <div>
                    <Checkbox
                        checked={this.props.relay.variables.unique}
                        inline
                        onChange={this.onUniqueChange}
                    >
                        Unique
                    </Checkbox>
                    <Checkbox
                        checked={this.props.relay.variables.tromso}
                        inline
                        onChange={this.onTromsoChange}
                    >
                        Tromsø
                    </Checkbox>
                </div>
            </div>
        );
        return (
            <section>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <form onSubmit={this.onSearch} onReset={this.onClear}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ margin: '0 10px' }} className="hidden-xs">
                                <Image
                                    responsive
                                    src="/img/logo2_ntnu_u-slagord.jpg"
                                    style={{ marginTop: 28, minWidth: 50 }}
                                />
                            </div>
                            <div style={{ flexGrow: 1, margin: '0 10px' }}>
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
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <p style={{ textAlign: 'center', fontSize: '2rem' }}>
                        {this.props.viewer.stats.unique} unique SNPs in {this.props.viewer.stats.total} results <small style={{ fontSize: '1.2rem' }}>for <span style={{ fontStyle: 'italic' }}>P</span> &lt; 5x10-8</small>
                    </p>
                </div>
                {this.props.viewer.results.edges.length > 0 ? <SearchResults results={this.props.viewer.results} />: <TraitList viewer={this.props.viewer}/>}
                {this.props.viewer.results.pageInfo.hasNextPage ? <Button onClick={this.loadMore}>Load more</Button> : null }
                <Footer />
            </section>
        );
    }
}

export default Relay.createContainer(Search, {
    initialVariables: {
        term: '',
        resultsToShow: pageSize,
        unique: false,
        tromso: false,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            results(first: $resultsToShow, term: $term, unique: $unique, tromso: $tromso)
            {
                edges {
                    node {
                        id
                        snp_id_current
                        snps
                        date
                        genes
                        traits
                        or_or_beta
                        pubmedid
                        region
                        chr_id
                        chr_pos
                        context
                        p_value
                        p_value_text
                        p95_ci
                        date_added_to_catalog
                        first_author
                        journal
                        tromso {
                            genotyped
                        }
                    }
                },
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            stats(
                term: $term
            ) {
                total
                unique
            }
            ${TraitList.getFragment('viewer')}
        }`,
    },
});
