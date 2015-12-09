import React from "react";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import {Input, Button, Table, Alert, Grid, Row, Col, Image} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link, History} from "react-router";

const ExternalLink = (props => {
    if (props.children) {
        return <a href={props.href} target="_blank">{props.children}</a>;
    }
    else {
        return <a href={props.href} target="_blank"><i className="fa fa-external-link"></i></a>;
    }
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
        this.onClear = this.onClear.bind(this);
    }

    static getStores(props) {
        return [GwasStore];
    }

    static getPropsFromStores(props) {
        return {
            results: GwasStore.getResults(),
            traits: GwasStore.getTraits(),
            different: GwasStore.getDifferent(),
            total: GwasStore.getTotal()
        };
    }

    componentDidUpdate(prevProps) {
        let location = this.props.location;
        let oldLocation = prevProps.location;
        let q = location.query.q;
        let oldQ = oldLocation.query.q;
        if (q !== oldQ) {
            GwasActions.search(q);
        }
    }

    onLinkClick(value, e) {
        GwasActions.search(value);
    }

    onSearch(e) {
        e.preventDefault();
        this.props.history.pushState(null, `/search/?q=${this.refs.query.getValue()}`)
        GwasActions.search(this.refs.query.getValue());
    }

    onClear(e) {
        this.props.history.pushState(null, `/search/`)
        GwasActions.search('');
    }

    rowclass(p) {
        if (p > 0.00000005) {
            return "uninteresting";
        }
    }
    exp(number) {
        if (number && !isNaN(number)) {
            return number.toExponential();
        }
    }
    getYear(datestring) {
        return datestring.split("-").pop();
    }
    renderResults() {
        if (!this.props.location.query.q) {
            return (
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <p style={{margin: "0 auto", textAlign: "center"}}>
                            <em>Use the search field or select from the traits below if you want to see some results</em>
                                </p>
                            <ul style={{WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3, listStyle: "none", paddingLeft: 0}}>
                            {this.props.traits.map(trait =>
                                                   <li key={trait.get("_id")}>
                                                       <Link to={`/search/?q=${trait.get("_id")}`}>{trait.get("_id")}</Link> <ExternalLink href={trait.get("uri")} />
                                                   </li>
                                                   )}
                                               </ul>
                        </Col>
                    </Row>
                </Grid>
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
        else {
            let exportButton = <Button href={`/search/?q=${this.props.location.query.q}.csv`} style={{float: "right", marginTop: -37, marginRight: 5}}>Download</Button>;
            return (
                <div>
                    {exportButton}
                    <Table striped condensed hover id="results">
                        <thead>
                            <tr>
                                <th>SNP</th>
                                <th>MAF</th>
                                <th>P</th>
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
                            {this.props.results.map(result =>
                            <tr key={result.get("_id")} className={this.rowclass(result.get("P-VALUE"))}>
                                <td>
                                    <div>
                                        <Link to={`/search/?q=${result.get("SNP_ID_CURRENT")}`}>
                                            {result.get("SNPS")}
                                        </Link>
                                    </div>
                                </td>
                                <td>
                                    {result.get("hunt")}
                                </td>
                                <td>
                                    <div>
                                        {this.exp(result.get("P-VALUE")) || "0.0" }
                                    </div>
                                    <div>
                                        {result.get("P-VALUE (TEXT)")}
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <Link to={`/search/?q=${result.get("REGION")}`}>
                                            {result.get("REGION")}
                                        </Link>
                                    </div>
                                    <div>
                                        <Link to={result.get("CHR_ID") ? `/search/?q=chr${result.get("CHR_ID")}:${result.get("CHR_POS")}` : ""}>
                                            {result.get("CHR_ID") ? `chr${result.get("CHR_ID")}:${result.get("CHR_POS")}` : ""}
                                        </Link>
                                    </div>
                                    <div title={result.get("CONTEXT")} style={{maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                        {result.get("CONTEXT")}
                                    </div>
                                </td>
                                <td>
                                    <ul>
                                        {result.get("MAPPED_GENE").split(" - ").map(gene => {
                                            return (
                                                <li>
                                                    <Link to={`/search/?q=${gene}`}>
                                                        {gene}
                                                    </Link> <ExternalLink href={`http://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene}`} />
                                                </li>
                                                );
                                            })
                                        }
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                    {result.get("MAPPED_TRAIT").split(", ").map(trait =>
                                        <li key={trait}>
                                            <Link to={`/search/?q=${trait}`}>
                                                {trait}
                                            </Link>
                                        </li>
                                    )}
                                    </ul>
                                </td>
                                <td>
                                    <div>{result.get("OR or BETA")}</div>
                                    <div>{result.get("95% CI (TEXT)")}</div>
                                </td>
                                <td>
                                    <div>{this.getYear(result.get("DATE"))}</div>
                                    <div className="uninteresting">{result.get("DATE ADDED TO CATALOG")}</div>
                                </td>
                                <td>
                                    <Link to={`/search/?q=${result.get("FIRST AUTHOR")}`}>
                                        {result.get("FIRST AUTHOR")}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`/search/?q=${result.get("PUBMEDID")}`}>
                                        {result.get("PUBMEDID")}
                                    </Link> <ExternalLink href={`http://www.ncbi.nlm.nih.gov/pubmed/${result.get("PUBMEDID")}`} />
                                    <div>{result.get("JOURNAL")}</div>
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            );
        }
    }

    render() {
        let buttons = <div><Button type="submit" bsStyle="primary">Search</Button><Button type="reset" bsStyle="link">Clear</Button></div>;
        let resultheader = <h2 style={{textAlign: "center"}}>{this.props.different} unique RS numbers in {this.props.total} results <small>for P &lt; 5x10<sup>-8</sup></small></h2>;
        let examples = <p>Examples: <Link to="/search/?q=diabetes">diabetes</Link>, <Link to="/search/?q=rs3820706">rs3820706</Link>, <Link to="/search/?q=Chung S">Chung S</Link>, <Link to="/search/?q=2q23.3">2q23.3</Link>, <Link to="/search/?q=CACNB4">CACNB4</Link></p>;
        return (
            <section id="main">
                <Grid>
                    <Row>
                        <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
                            <form onSubmit={this.onSearch} onReset={this.onClear}>
                                <Row>
                                    <Col sm={1}>
                                        <Image responsive src="/img/logo2_ntnu_u-slagord.jpg" className="hidden-xs" style={{marginTop: 28}}/>
                                    </Col>
                                    <Col sm={11}>
                                        <h1>HUNT fast-track GWAS catalog search</h1>
                                        <Input
                                            type="text"
                                            ref="query"
                                            placeholder={this.props.location.query.q || "Search"}
                                            help={examples}
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
                <hr />
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <footer style={{fontSize: 11, color: "#aaa", textAlign: "center", paddingBottom: 50}}>
                            GWAS data from <ExternalLink href="https://www.ebi.ac.uk/gwas/docs/downloads">NHGRI-EBI</ExternalLink><br />
                            The usual warnings about providing the service AS-IS applies.<br />
                            <ExternalLink href="http://www.ntnu.no/ism/epicenter/home">Human genetic epidemiology group (HGE)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/ism">Department of public health and general practice (ISM)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/">Norwegian university of science and technology (NTNU)</ExternalLink></footer>
                        </Col>
                    </Row>
                </Grid>
            </section>
        );
    }
}

export default connectToStores(App);
