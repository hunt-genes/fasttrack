/* global window */

// Set state during browser rendring. This will cause a flicker, but we need it.
/* eslint "react/no-did-mount-set-state": 0 */

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import moment from 'moment';
import React from 'react';
import Relay from 'react-relay';
import prefix from '../prefix';
import theme from '../theme';
import OrderVariablesMutation from '../mutations/orderVariables';
import OrderSnpTable from './OrderSnpTable';
import { validateEmail, validateProject } from '../lib/validations';

class Order extends React.Component {
    static propTypes = {
        location: React.PropTypes.object,
        relay: React.PropTypes.object,
        site: React.PropTypes.object,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        selected: new Map(),
        project: '',
        comment: '',
        email: '',
        ordered: false,
        emailValid: true,
        emailWritten: false,
        projectValid: true,
        projectWritten: false,
        downloadSnpsOpen: false,
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    componentDidMount() {
        const selected = window.localStorage.getItem('orderSelected');
        const email = window.localStorage.getItem('email');
        const project = window.localStorage.getItem('project');
        const comment = window.localStorage.getItem('comment');
        const newState = {};
        if (selected) {
            newState.selected = new Map(JSON.parse(selected));
        }
        if (email) {
            newState.email = email;
            newState.emailWritten = true;
        }
        if (project) {
            newState.project = project;
        }
        if (comment) {
            newState.comment = comment;
        }
        this.setState(newState);
    }

    onSubmitOrder = (event) => {
        event.preventDefault();
        this.setState({ ordered: true });
        if (validateEmail(this.state.email) && this.state.project) {
            this.context.relay.commitUpdate(new OrderVariablesMutation({
                email: this.state.email,
                project: this.state.project,
                comment: this.state.comment,
                snps: Array.from(this.state.selected.keys()),
                site: this.props.site,
            }));
        }
    }

    onChangeProject = (event, project) => {
        if (this.state.projectWritten) {
            this.setState({ project, projectValid: validateProject(project) });
        }
        else {
            this.setState({ project });
        }
    }

    onChangeComment = (event, comment) => {
        this.setState({ comment });
    }

    onChangeEmail = (event, email) => {
        if (this.state.emailWritten) {
            this.setState({ email, emailValid: validateEmail(email) });
        }
        else {
            this.setState({ email });
        }
    }

    onBlurEmail = () => {
        this.setState({ emailWritten: true, emailValid: validateEmail(this.state.email) });
    }

    onBlurProject = () => {
        this.setState({ projectWritten: true, projectValid: validateProject(this.state.project) });
    }

    onClickBack = () => {
        this.context.router.goBack();
    }

    onClickDone = () => {
        this.setState({
            selected: new Map(),
            comment: '',
            ordered: false,
        });
        window.localStorage.removeItem('orderSelected');
        window.localStorage.removeItem('email');
        window.localStorage.removeItem('project');
        window.localStorage.removeItem('comment');
        const query = this.props.location.query;
        this.context.router.push({
            pathname: prefix,
            query,
        });
    }

    onDownloadDialogClose = () => {
        this.setState({ downloadSnpsOpen: false });
    }

    onDownloadClick = () => {
        // do not preventDefault here
        this.setState({ downloadSnpsOpen: false });
    }

    openDownloadSnps = () => {
        this.setState({ downloadSnpsOpen: true });
    }

    render() {
        const errorStyle = {
            color: theme.palette.errorColor,
        };
        const warningStyle = {
            color: theme.palette.accent1Color,
        };
        const snps = Array.from(this.state.selected.keys());
        snps.sort((a, b) => {
            return b < a;
        });

        const downloadActions = (
            <form action={`${prefix}/snps`} method="POST">
                <input type="hidden" name="snps" value={snps} />
                <RaisedButton label="Download" type="submit" onClick={this.onDownloadClick} primary />
                <RaisedButton label="Cancel" onTouchTap={this.onDownloadDialogClose} />
            </form>
        );
        const downloadDialog = (
            <Dialog
                title="Download SNP list"
                open={this.state.downloadSnpsOpen}
                onRequestClose={this.onDownloadDialogClose}
                actions={downloadActions}
                actionContainerStyle={{ textAlign: 'inherit' }}
                autoScrollBodyContent
            >
                <p>This will download the list of SNPs as a csv file.</p>
                <p>Fields are separated by commas, individual traits and genes, by semicolons.</p>
                <p>Downloading a SNP-list-file will not be registered as an order. You must click the «Send»-button in order to effectuate your order.</p>
            </Dialog>
        );
        const { emailValid, projectValid } = this.state;
        return (
            <section>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {this.state.ordered && this.props.site.order
                        ? <div>
                            {this.props.relay.hasOptimisticUpdate(this.props.site)
                                ? <div>
                                    <h1>Please wait</h1>
                                    <p>Order is not confirmed yet</p>
                                </div>
                                    : <div>
                                        <h1>Thank you for your order</h1>
                                        <p>Your order was sent {moment(this.props.site.order.createdAt).format('lll')}, and contains the following SNPs:</p>
                                    </div>
                            }
                            <OrderSnpTable snps={snps} results={this.state.selected} />
                            {downloadDialog}
                            <RaisedButton onClick={this.openDownloadSnps} label="Download" />
                            <p>You will receive an email with a confirmation on submitted SNP-order to {this.props.site.order.email} shortly.</p>
                            <p>Please contact us {this.props.site.email ? `at ${this.props.site.email} ` : '' }if there is something wrong with your order.</p>
                            <RaisedButton label="Done" onClick={this.onClickDone} />
                        </div>
                        : <div>
                            {this.state.selected.size
                                ? <div>
                                    <form onSubmit={this.onSubmitOrder}>
                                        <h1>You have selected {snps.length} SNPs to order from HUNT</h1>
                                        <p>Please use your HUNT case number (saksnummer) as identification. To order SNP-data from HUNT, you need a submitted and/or approved HUNT-application. Please refer to the HUNT website for details for application procedures, <a href="https://www.ntnu.no/hunt">www.ntnu.no/hunt</a>.</p>
                                        <div>
                                            <TextField
                                                id="project"
                                                floatingLabelText="Project / case number"
                                                onChange={this.onChangeProject}
                                                value={this.state.project}
                                                onBlur={this.onBlurProject}
                                                errorStyle={projectValid
                                                    ? warningStyle
                                                    : errorStyle
                                                }
                                                errorText={projectValid
                                                    ? 'Format: 2017/123'
                                                    : 'Invalid project number, it should be like 2017/123'
                                                }
                                            />
                                        </div>
                                        <div>
                                            <TextField
                                                id="email"
                                                type="email"
                                                floatingLabelText="Email"
                                                onChange={this.onChangeEmail}
                                                onBlur={this.onBlurEmail}
                                                errorText={emailValid
                                                    ? 'Your email, not to your PI or supervisor. We will use this for e-mail confirmation and later communications.'
                                                    : 'Email is not valid, is it an @ntnu.no address?'
                                                }
                                                errorStyle={emailValid ? warningStyle : errorStyle}
                                                fullWidth
                                                value={this.state.email}
                                            />
                                        </div>
                                        <div>
                                            <TextField
                                                id="comment"
                                                floatingLabelText="Comment"
                                                fullWidth
                                                multiLine
                                                onChange={this.onChangeComment}
                                                value={this.state.comment}
                                            />
                                        </div>
                                        <div style={{ marginTop: '2rem' }}>
                                            <RaisedButton
                                                primary
                                                label="Send"
                                                type="submit"
                                                disabled={!emailValid || !projectValid}
                                            />
                                            <RaisedButton
                                                label="Back"
                                                onClick={this.onClickBack}
                                            />
                                        </div>
                                        <RaisedButton style={{ float: 'right', marginTop: '1rem' }} onClick={this.openDownloadSnps} label="Download" />
                                        <h2>Please verify your SNP-order before submitting</h2>
                                        <OrderSnpTable snps={snps} results={this.state.selected} />
                                    </form>
                                    {downloadDialog}
                                </div>
                                : <div>
                                    <h1 id="download">You have selected no SNPs yet</h1>
                                    <p>Please go back and select some SNPs, if you want to order variables from HUNT</p>
                                    <RaisedButton
                                        label="Back"
                                        onClick={this.onClickBack}
                                    />
                                </div>
                            }
                        </div>
                    }
                </div>
            </section>
        );
    }
}

export default Relay.createContainer(Order, {
    fragments: {
        site: () => {
            return Relay.QL`
            fragment on Site {
                id
                email
                order {
                    id
                    email
                    snps
                    createdAt
                }
                ${OrderVariablesMutation.getFragment('site')}
            }`;
        },
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
            }`;
        },
    },
});
