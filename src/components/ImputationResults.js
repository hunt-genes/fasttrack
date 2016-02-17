import React from "react";

class ImputationResults extends React.Component {
    render() {
        if (!this.props.imputed) {
            return <div />;
        }
        return (
            <div>
                {this.props.imputed.get("tromso").get("MAF")}
                <br />
                {this.props.imputed.get("tromso").get("REF")}
                {" "}
                {this.props.imputed.get("tromso").get("ALT")}
            </div>
        );
    }
}

export default ImputationResults;
