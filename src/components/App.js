import React from "react";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import { Input, Button, Table, Alert, Grid, Row, Col, Image } from "react-bootstrap";
import { Link } from "react-router";
import Footer from "./Footer";
import TraitList from "./TraitList";
import Result from "./Result";

class App extends React.Component {
    static getStores() {
        return [GwasStore];
    }

    static getPropsFromStores() {
        return {
            results: GwasStore.getResults(),
        };
    }

    constructor(props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
        this.onClear = this.onClear.bind(this);
        this.onQueryChange = this.onQueryChange.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);

        this.state = {
            query: this.props.location.query.q || "",
            hunt: this.props.location.query.hunt || false,
        };
    }

    componentWillReceiveProps(nextProps) {
        const location = this.props.location;
        const newLocation = nextProps.location;
        const q = location.query.q;
        const newQ = newLocation.query.q;
        const hunt = location.query.hunt;
        const newHunt = newLocation.query.hunt === "true";
        if (q !== newQ || hunt !== newHunt) {
            this.setState({ query: newQ || "", hunt: newHunt || false });
            GwasActions.search(newQ, newHunt);
        }
    }

    onQueryChange(e) {
        this.setState({ query: e.target.value });
    }

    onCheckboxChange(e) {
        this.props.history.pushState(null, `/search/?q=${this.refs.query.getValue()}&hunt=${this.refs.hunt.getChecked()}`);
    }

    onSearch(e) {
        e.preventDefault();
        this.props.history.pushState(null, `/search/?q=${this.refs.query.getValue()}&hunt=${this.refs.hunt.getChecked()}`);
    }

    onClear() {
        this.props.history.pushState(null, `/search/?hunt=${this.refs.hunt.getChecked()}`);
    }

    renderResults() {
        if (!this.props.location.query.q) {
            return (
                <TraitList />
            );
        }
        else if (this.props.location.query.q && this.props.location.query.q.length < 3) {
            return (
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <Alert bsStyle="danger">We need at least three characters, or we will crash your browser</Alert>
                        </Col>
                    </Row>
                </Grid>
            );
        }
        const exportButton = <Button href={`/search/?q=${this.props.location.query.q}.csv`} style={{ float: "right", marginTop: -37, marginRight: 5 }} download><i className="fa fa-download"></i> <span className="hidden-xs">Export</span></Button>;
        return (
            <div>
                {exportButton}
                <Table striped condensed hover id="results">
                    <thead>
                        <tr>
                            <th>SNP</th>
                            <th>MAF</th>
                            <th><i>P</i></th>
                            <th>Position</th>
                            <th>Mapped gene</th>
                            <th>Mapped trait</th>
                            <th>OR or Beta</th>
                            <th>Year</th>
                            <th>First author</th>
                            <th>Pubmed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.results.get("data").map(result =>
                            <Result key={result.get("_id")} data={result} />
                        )}
                    </tbody>
                </Table>
            </div>
        );
    }

    render() {
        const buttons = <div><Button type="submit" bsStyle="primary">Search</Button><Button type="reset" bsStyle="link">Clear</Button></div>;
        const resultheader = <h2 style={{ textAlign: "center" }}>{this.props.results.get("different")} unique RS numbers in {this.props.results.get("total")} results <small>for <i>P</i> &lt; 5x10<sup>-8</sup></small></h2>;
        const examples = <p>Examples: <Link to="/search/?q=diabetes">diabetes</Link>, <Link to="/search/?q=rs3820706">rs3820706</Link>, <Link to="/search/?q=Chung S">Chung S</Link>, <Link to="/search/?q=2q23.3">2q23.3</Link>, <Link to="/search/?q=CACNB4">CACNB4</Link></p>;
        const help = (
            <Row>
                <Col xs={9}>
                    {examples}
                </Col>
                <Col xs={3} className="compact">
                    <Input type="checkbox" label="HUNT" ref="hunt" checked={this.state.hunt} onChange={this.onCheckboxChange}/>
                </Col>
            </Row>
        );
        return (
            <section id="main">
                <Grid>
                    <Row>
                        <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
                            <form onSubmit={this.onSearch} onReset={this.onClear}>
                                <Row>
                                    <Col sm={1}>
                                        <Image responsive src="/img/logo2_ntnu_u-slagord.jpg" className="hidden-xs" style={{ marginTop: 28 }}/>
                                    </Col>
                                    <Col sm={11}>
                                        <h1>HUNT fast-track GWAS catalog search</h1>
                                        <Input
                                            type="text"
                                            ref="query"
                                            placeholder="Search"
                                            value={this.state.query}
                                            onChange={this.onQueryChange}
                                            help={help}
                                            buttonAfter={buttons}
                                        />
                                    </Col>
                                </Row>
                            </form>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            {resultheader}
                        </Col>
                    </Row>
                </Grid>
                {this.renderResults()}
                <Footer />
            </section>
        );
    }
}

App.propTypes = {
    results: React.PropTypes.object,
    requests: React.PropTypes.object,
    location: React.PropTypes.object,
    history: React.PropTypes.object,
};

export default connectToStores(App);
