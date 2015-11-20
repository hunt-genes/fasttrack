import React from "react";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import {Input, Button, Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link, History} from "react-router";

class App extends React.Component {

    static getStores(props) {
        return [GwasStore];
    }

    static getPropsFromStores(props) {
        return {results: GwasStore.getResults(), count: GwasStore.getCount()};
    }

    componentDidMount() {
        if (this.props.results.count() === 0) {
            console.log("mounted", this.props.params.q);
            //GwasActions.search(this.props.params.q);
        }
    }

    onLinkClick(value, e) {
        GwasActions.search(value);
    }

    onSearch(e) {
        e.preventDefault();
        GwasActions.search(this.refs.query.getValue());
    }

    rowclass(p) {
        if (!p || p > 0.00000005) {
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
    render() {
        //console.log("render");
        let button = <Button bsStyle="primary" onClick={this.onSearch.bind(this)}>Search</Button>;
        let max = 100;
        if (this.props.count < 100) {
            max = this.props.count;
        }
        let resultheader = <h2 style={{textAlign: "center"}}>{this.props.count} results <small>showing 1 to {max}</small></h2>;
        return (
            <section id="main">
                <form onSubmit={this.onSearch.bind(this)} style={{width: "500px", margin: "0 auto"}}>
                    <h1 style={{textAlign: "center"}}>Search HUNT GWAS catalog</h1>
                    <Input type="text" ref="query" placeholder="rs693" buttonAfter={button} defaultValue={this.props.query} />
                </form>
                {resultheader}
                <Table striped condensed hover id="results">
                    <thead>
                        <tr>
                            <th>SNP</th>
                            <th>P</th>
                            <th>Region</th>
                            <th>Mapped trait</th>
                            <th>Disease/trait</th>
                            <th>Year</th>
                            <th>First author</th>
                            <th>Pubmed</th>
                            <th>Journal</th>
                            <th>Study</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.results.map(result =>
                        <tr key={result.get("_id")} className={this.rowclass(result.get("P-VALUE"))}>
                            <td>
                                <div>
                                    <Link to={`/search/${result.get("SNP_ID_CURRENT")}`} onClick={this.onLinkClick.bind(this, result.get("SNP_ID_CURRENT"))}>
                                        {result.get("SNP_ID_CURRENT")}
                                    </Link>
                                </div>
                                <div>{result.get("SNPS")}</div>
                            </td>
                            <td>
                                <div>
                                    {this.exp(result.get("P-VALUE"))}
                                </div>
                                <div>
                                    {result.get("hunt")}
                                </div>
                                <div>
                                    {result.get("P-VALUE (TEXT)")}
                                </div>
                            </td>
                            <td>
                                <div>
                                    <Link to={`/search/${result.get("REGION")}`} onClick={this.onLinkClick.bind(this, result.get("REGION"))}>
                                        {result.get("REGION")}
                                    </Link>
                                </div>
                                <div>
                                    {result.get("CHR_POS")}
                                </div>
                                <div title={result.get("CONTEXT")} style={{maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                    {result.get("CONTEXT")}
                                </div>
                            </td>
                            <td>
                                <ul>
                                {result.get("MAPPED_TRAIT").split(", ").map(trait =>
                                    <li key={trait}>
                                        <Link to={`/search/${trait}`} onClick={this.onLinkClick.bind(this, trait)}>
                                            {trait}
                                        </Link>
                                    </li>
                                )}
                                </ul>
                            </td>
                            <td>{result.get("DISEASE/TRAIT")}</td>
                            <td>{this.getYear(result.get("DATE"))}</td>
                            <td>
                                <Link to={`/search/${result.get("FIRST AUTHOR")}`} onClick={this.onLinkClick.bind(this, result.get("FIRST AUTHOR"))}>
                                    {result.get("FIRST AUTHOR")}
                                </Link>
                            </td>
                            <td>
                                <Link to={`/search/${result.get("PUBMEDID")}`} onClick={this.onLinkClick.bind(this, result.get("PUBMEDID"))} params={{q: result.get("PUBMEDID")}}>
                                    {result.get("PUBMEDID")}
                                </Link>
                            </td>
                            <td>{result.get("JOURNAL")}</td>
                            <td>{result.get("STUDY")}</td>
                        </tr>
                        )}
                    </tbody>
                </Table>
            </section>
        );
    }
}

export default connectToStores(App);
