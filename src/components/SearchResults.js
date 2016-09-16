import React from 'react';
import { Grid, Row, Col, Table } from 'react-bootstrap';
import Relay from 'react-relay';
import { Link } from 'react-router';
import ExternalLink from './ExternalLink';

export default class SearchResults extends React.Component {

    render() {
        return (
            <Table>
                <tbody>
                    {this.props.results.edges.map(edge => (
                        <tr>
                            <td>
                                {edge.node.SNP_ID_CURRENT}
                            </td>
                        </tr>
                        ))
                    }
                </tbody>
            </Table>
        );
    }
}
