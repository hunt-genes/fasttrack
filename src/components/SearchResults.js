import React from 'react';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import Relay from 'react-relay';
import { Link } from 'react-router';
import ExternalLink from './ExternalLink';
import Result from './Result';

export default class SearchResults extends React.Component {

    render() {
        return (
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
                    {this.props.results.edges.map(edge => (
                        <Result key={edge.node.id} {...edge.node} />
                        ))
                    }
                </tbody>
            </Table>
        );
    }
}
