import React from "react";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import {Input, Button, Table, Alert} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link, History} from "react-router";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
    }

    static getStores(props) {
        return [GwasStore];
    }

    static getPropsFromStores(props) {
        return {results: GwasStore.getResults(), count: GwasStore.getCount()};
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
            return <p style={{width: "500px", margin: "0 auto"}}><em>Use the search field if you want to see some results</em></p>;
        }
        else if (this.props.params.q && this.props.params.q.length < 3) {
            return <Alert style={{width: "500px", margin: "0 auto"}} bsStyle="danger">We need at least three characters, or we will crash your browser</Alert>;
        }
        else {
            return (
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
                                {result.get("CHR_ID") ? `chr${result.get("CHR_ID")}:${result.get("CHR_POS")}` : ""}
                                </div>
                                <div title={result.get("CONTEXT")} style={{maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                    {result.get("CONTEXT")}
                                </div>
                            </td>
                            <td>
                                <div>
                                    <Link to={`/search/${result.get("MAPPED_GENE")}`}>
                                        {result.get("MAPPED_GENE")}
                                    </Link>
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
                                </Link> <a href={`http://www.ncbi.nlm.nih.gov/pubmed/${result.get("PUBMEDID")}`}><i className="fa fa-external-link"></i></a>
                                <div>{result.get("JOURNAL")}</div>
                            </td>
                        </tr>
                        )}
                    </tbody>
                </Table>
            );
        }
    }

    render() {
        //console.log("render", this.props.params.q);
        let button = <Button type="submit" bsStyle="primary">Search</Button>;
        let resultheader = <h2 style={{textAlign: "center"}}>{this.props.count} results <small>for P &lt; 5x10<sup>-8</sup></small></h2>;
        let examples = <p>Examples: <Link to="/search/diabetes">diabetes</Link>, <Link to="/search/rs3820706">rs3820706</Link>, <Link to="/search/Chung S">Chung S</Link>, <Link to="/search/2q23.3">2q23.3</Link>, <Link to="/search/CACNB4">CACNB4</Link></p>;
        return (
            <section id="main">
                <form onSubmit={this.onSearch} style={{width: "500px", margin: "0 auto"}}>
                    <h1 style={{textAlign: "center"}}>Search HUNT GWAS catalog</h1>
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
            </section>
        );
    }
}

export default connectToStores(App);
