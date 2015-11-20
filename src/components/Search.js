import React from "react";
import connectToStores from "alt/utils/connectToStores";
import GwasActions from "../actions/GwasActions";
import GwasStore from "../stores/GwasStore";
import {Input, Button, Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link, History} from "react-router";

class Search extends React.Component {

    static getStores(props) {
        return [GwasStore];
    }

    static getPropsFromStores(props) {
        return {results: GwasStore.getResults(), count: GwasStore.getCount()};
    }

    componentDidMount() {
        GwasActions.search(this.props.params.q);
    }

    onLinkClick(value, e) {
        //e.preventDefault();
        GwasActions.search(value);
    }

    onSearch(e) {
        e.preventDefault();
        GwasActions.search(this.refs.query.getValue());
    }

        render() {
        console.log("render");
        let button = <Button bsStyle="primary" onClick={this.onSearch.bind(this)}>Search</Button>;
        let max = 100;
        if (this.props.count < 100) {
            max = this.props.count;
        }
        let resultheader = <h1 style={{textAlign: "center"}}>{this.props.count} results <small>showing 1 to {max}</small></h1>;
        return (
            <section id="main">
            <form onSubmit={this.onSearch.bind(this)} style={{width: "400px", margin: "0 auto"}}>
                <h1 style={{textAlign: "center"}}>Search GWAS catalog</h1>
                <Input type="text" ref="query" placeholder="rs693" buttonAfter={button}/>
            </form>
            {resultheader}
            <Table striped condensed hover id="results">
            <thead>
            <tr>
            <th>SNP_ID</th>
            <th>SNPS</th>
            <th>Region</th>
            <th>Mapped trait</th>
            <th>Disease/trait</th>
            <th>First author</th>
            <th>Pubmed</th>
            <th>Journal</th>
            <th>Study</th>
            </tr>
            </thead>
            <tbody>
            {this.props.results.map(result =>
                <tr key={result.get("_id")}>
                    <td>
                        <Link to={`/${result.get("SNP_ID_CURRENT")}`} onClick={this.onLinkClick.bind(this, result.get("SNP_ID_CURRENT"))}>
                            {result.get("SNP_ID_CURRENT")}
                        </Link>
                    </td>
                    <td>{result.get("SNPS")}</td>
                    <td>
                        <Link to={`/${result.get("REGION")}`} onClick={this.onLinkClick.bind(this, result.get("REGION"))}>
                            {result.get("REGION")}
                        </Link>
                    </td>
                    <td>
                        <ul>
                        {result.get("MAPPED_TRAIT").split(", ").map(trait =>
                            <li key={trait}>
                                <Link to={`/${trait}`} onClick={this.onLinkClick.bind(this, trait)}>
                                    {trait}
                                </Link>
                            </li>
                        )}
                        </ul>
                    </td>
                    <td>{result.get("DISEASE/TRAIT")}</td>
                    <td>
                        <Link to={`/${result.get("FIRST AUTHOR")}`} onClick={this.onLinkClick.bind(this, result.get("FIRST AUTHOR"))}>
                            {result.get("FIRST AUTHOR")}
                        </Link>
                    </td>
                    <td>
                        <Link to={`/${result.get("PUBMEDID")}`} onClick={this.onLinkClick.bind(this, result.get("PUBMEDID"))} params={{q: result.get("PUBMEDID")}}>
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

export default connectToStores(Search);
