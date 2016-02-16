import React from "react";

class ImputationResults extends React.Component {
    render() {
        if (!this.props.imputed) {
            return <div />;
        }
        return (
            <div>
                {this.props.imputed.get("hunt").get("MAF")}
                <br />
                {this.props.imputed.get("hunt").get("REF")}
                {" "}
                {this.props.imputed.get("hunt").get("ALT")}
                <div className={this.props.imputed.get("hunt").get("Genotyped") ? "genotyped" : "imputed"}>
                    {this.props.imputed.get("hunt").get("AvgCall").toFixed(5)}
                </div>
            </div>
        );
    }
}

export default ImputationResults;
