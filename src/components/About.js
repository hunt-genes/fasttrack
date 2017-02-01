import React from 'react';
import ExternalLink from './ExternalLink';

class Footer extends React.Component {
    render() {
        return (
            <main id="about" style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ margin: '0 10px' }}>
                    <h1>About</h1>
                    <h2>Data sources</h2>
                    <h3>NHGRI-EBI</h3>
                    <div>
                        <div className="cite-names">Burdett T (EBI), Hall PN (NHGRI), Hasting E (EBI) Hindorff LA (NHGRI), Junkins HA (NHGRI), Klemm AK (NHGRI), MacArthur J (EBI), Manolio TA (NHGRI), Morales J (EBI), Parkinson H (EBI) and Welter D (EBI).</div>
                        The NHGRI-EBI Catalog of published genome-wide association studies.<br />
                        Available at: <a href="https://www.ebi.ac.uk/gwas">www.ebi.ac.uk/gwas</a>. Accessed 2016-10-12, version v1.0.1.
                    </div>
                    <h3>Tromsøundersøkelsen</h3>
                    <p>Information about imputed <ExternalLink href="https://uit.no/forskning/forskningsgrupper/gruppe?p_document_id=367276">Tromsøundersøkelsen</ExternalLink> data.</p>
                    <h3>HUNT and HUNT-Genes</h3>
                    <p>Information about imputed HUNT data from <ExternalLink href="https://www.ntnu.edu/huntgenes">K.G. Jebsen Center for Genetic Epidemiology</ExternalLink> (Huntgenes) group at <ExternalLink href="https://www.ntnu.edu/">NTNU</ExternalLink></p>
                    <h2>Warnings and warranty</h2>
                    <p>The usual warnings about providing the service AS-IS applies.</p>
                    <p>You should depend on the <ExternalLink href="https://www.ebi.ac.uk/gwas">original GWAS service from NHGRI-EBI</ExternalLink> for research.</p>
                    <h2>Source code and license</h2>
                    <p>This software is licensed under AGPL-3.0 and you can find the source code on <a href="https://github.com/hunt-genes/fasttrack">github.com/hunt-genes/fasttrack</a>.</p>
                </div>
            </main>
        );
    }
}

export default Footer;
