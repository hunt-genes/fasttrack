import React from "react";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import {Input, Button, Table, Alert, Grid, Row, Col} from "react-bootstrap";
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
        let oldQ = prevProps.params.q;
        let newQ = this.props.params.q;
        if (newQ !== oldQ) {
            GwasActions.search(this.props.params.q);
        }
    }

    onLinkClick(value, e) {
        GwasActions.search(value);
    }

    onSearch(e) {
        e.preventDefault();
        this.props.history.pushState(null, `/search/${this.refs.query.getValue()}`)
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
        if (!this.props.params.q) {
            return (
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <p style={{width: "600px", margin: "0 auto", textAlign: "center"}}>
                            <em>Use the search field or select from the traits below if you want to see some results</em>
                                </p>
                            <ul style={{WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3, listStyle: "none", paddingLeft: 0}}>
                            {this.props.traits.map(trait =>
                                                   <li key={trait.get("_id")}>
                                                       <Link to={`/search/${trait.get("_id")}`}>{trait.get("_id")}</Link> <ExternalLink href={trait.get("uri")} />
                                                   </li>
                                                   )}
                                               </ul>
                        </Col>
                    </Row>
                </Grid>
            );
        }
        else if (this.props.params.q && this.props.params.q.length < 3) {
            return <Alert style={{width: "600px", margin: "0 auto"}} bsStyle="danger">We need at least three characters, or we will crash your browser</Alert>;
        }
        else {
            let exportButton = <Button href={`/search/${this.props.params.q}.csv`} style={{float: "right", marginTop: -37, marginRight: 5}}>Download</Button>;
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
                                        <Link to={`/search/${result.get("SNP_ID_CURRENT")}`}>
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
                                        <Link to={`/search/${result.get("REGION")}`}>
                                            {result.get("REGION")}
                                        </Link>
                                    </div>
                                    <div>
                                        <Link to={result.get("CHR_ID") ? `/search/chr${result.get("CHR_ID")}:${result.get("CHR_POS")}` : ""}>
                                            {result.get("CHR_ID") ? `chr${result.get("CHR_ID")}:${result.get("CHR_POS")}` : ""}
                                        </Link>
                                    </div>
                                    <div title={result.get("CONTEXT")} style={{maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                        {result.get("CONTEXT")}
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <Link to={`/search/${result.get("MAPPED_GENE")}`}>
                                            {result.get("MAPPED_GENE")}
                                        </Link> <ExternalLink href={`http://www.genecards.org/cgi-bin/carddisp.pl?gene=${result.get("MAPPED_GENE")}`} />
                                    </div>
                                </td>
                                <td>
                                    <ul>
                                    {result.get("MAPPED_TRAIT").split(", ").map(trait =>
                                        <li key={trait}>
                                            <Link to={`/search/${trait}`}>
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
                                    <Link to={`/search/${result.get("FIRST AUTHOR")}`}>
                                        {result.get("FIRST AUTHOR")}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={`/search/${result.get("PUBMEDID")}`}>
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
        //console.log("render", this.props.params.q);
        let button = <div><Button type="submit" bsStyle="primary">Search</Button><Button type="reset" bsStyle="link">Clear</Button></div>;
        let resultheader = <h2 style={{textAlign: "center"}}>{this.props.different} unique RS numbers in {this.props.total} results <small>for P &lt; 5x10<sup>-8</sup></small></h2>;
        let examples = <p>Examples: <Link to="/search/diabetes">diabetes</Link>, <Link to="/search/rs3820706">rs3820706</Link>, <Link to="/search/Chung S">Chung S</Link>, <Link to="/search/2q23.3">2q23.3</Link>, <Link to="/search/CACNB4">CACNB4</Link></p>;
        return (
            <section id="main" style={{backgroundImage: "url('/img/logo2_ntnu_u-slagord.jpg')", backgroundSize: 80, backgroundRepeat: "no-repeat", backgroundPosition: "top right", marginRight: 20}}>
                <form onSubmit={this.onSearch} onReset={this.onClear} style={{width: "600px", margin: "0 auto", backgroundColor: "white"}}>
                    <h1 style={{textAlign: "center"}}>Search HUNT fast-track GWAS catalog</h1>
                    <Input
                        type="text"
                        ref="query"
                        placeholder={this.props.params.q || "Search"}
                        help={examples}
                        buttonAfter={button}
                    />
                </form>
                {resultheader}
                {this.renderResults()}
                <hr />
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <footer style={{fontSize: 11, color: "#aaa", textAlign: "center", paddingBottom: 50}}>
                            The usual warnings about providing the service AS-IS applies.<br />
                            GWAS data from <ExternalLink href="https://www.ebi.ac.uk/gwas/docs/downloads">NHGRI-EBI</ExternalLink><br />
                            <ExternalLink href="http://www.ntnu.no/ism/epicenter/home">Human genetic epidemiology group (HGE)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/ism">Department of public health and general practice (ISM)</ExternalLink>, <ExternalLink href="http://www.ntnu.edu/">Norwegian university of science and technology (NTNU)</ExternalLink></footer>
                        </Col>
                    </Row>
                </Grid>
            </section>
        );
    }
}

export default connectToStores(App);
