
export default function prepareQuery(_query, _unique = false, _tromso = false, _hunt = false) {
    const query = {};
    const fields = [];

    let q = _query;
    // query param handling
    if (q && q.length < 3) {
        q = '';
    }
    if (q) {
        // TODO: Should we fix the SNP field to be an integer? YES, it's not
        // even working normally now, but that may be a different issue.
        const chrSearch = q.match(/^chr(\w+):(\d+)$/);
        if (!isNaN(q)) {
            fields.push({ pubmedid: q });
            fields.push({ snps: `rs${q}` });
        }
        else if (chrSearch) {
            const chrid = chrSearch[1];
            const chrpos = chrSearch[2];
            query.chr_id = +chrid;
            query.chr_pos = +chrpos;
        }
        else if (q.startsWith('rs')) {
            /*
            q = q.replace("rs", "");
            if (!isNaN(q)) {
                fields.push({snp_id_current: q});
            }
            */
            fields.push({ snps: q });
        }
        else {
            const r = RegExp(q, 'i');
            fields.push({ region: { $regex: r } });
            fields.push({ first_author: { $regex: r } });
            fields.push({ traits: { $regex: r } });
            fields.push({ disease_trait: { $regex: r } });
            fields.push({ mapped_gene: { $regex: r } });
        }
    }

    query.p_value = { $lt: 0.00000005, $exists: true, $ne: null };
    if (fields.length) {
        query.$or = fields;
    }
    if (_hunt) {
        query.hunt = { $exists: true };
    }
    if (_tromso) {
        query.tromso = { $exists: true };
    }
    if (_unique) {
        query.best_for_unique = true;
    }

    return query;
}
