import {
    GraphQLBoolean,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
} from 'graphql';

import {
  fromGlobalId,
  globalIdField,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromArray,
} from 'graphql-relay';

import connectionFromMongooseQuery from 'relay-mongoose-connection';

import Result from './models/Result';
import Trait from './models/Trait';

import { startsWith } from 'lodash';

function prepareQuery(_query, options = {}) {
    const query = {};
    const fields = [];

    const tromso = options.tromso || false;
    const unique = options.unique || false;

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
            fields.push({ PUBMEDID: q });
            fields.push({ SNPS: 'rs' + q });
        }
        else if (chrSearch) {
            const [_, chrid, chrpos] = chrSearch;
            query.CHR_ID = +chrid;
            query.CHR_POS = +chrpos;
        }
        else if (startsWith(q, 'rs')) {
            /*
            q = q.replace("rs", "");
            if (!isNaN(q)) {
                fields.push({SNP_ID_CURRENT: q});
            }
            */
            fields.push({ SNPS: q });
        }
        else {
            const r = RegExp(q, 'i');
            fields.push({ REGION: { $regex: r } });
            fields.push({ 'FIRST AUTHOR': { $regex: r } });
            fields.push({ traits: { $regex: r } });
            fields.push({ 'DISEASE/TRAIT': { $regex: r } });
            fields.push({ 'MAPPED_GENE': { $regex: r } });
        }

        query['P-VALUE'] = { $lt: 0.00000005, $exists: true, $ne: null };
        if (fields.length) {
            query.$or = fields;
        }
        if (tromso) {
            query.imputed = { $exists: 1 };
        }
    }

    return query;
}

class ResultDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class UserDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'Result') {
            return Result.findById(id).exec().then((result) => new ResultDTO(result.toObject()));
        }
        if (type === 'User') {
            return new UserDTO({ id });
        }
    },
    (obj) => {
        if (obj instanceof ResultDTO) {
            return resultType;
        }
        if (obj instanceof UserDTO) {
            return userType;
        }
        return null;
    }
);

const traitType = new GraphQLObjectType({
    name: 'Trait',
    fields: {
        id: { type: GraphQLString },
        uri: { type: GraphQLString },
    },
});

const resultType = new GraphQLObjectType({
    name: 'Result',
    fields: {
        id: globalIdField('Result'),
        SNP_ID_CURRENT: { type: GraphQLString },
        SNPS: { type: GraphQLString },
        PUBMEDID: { type: GraphQLString },
        MAPPED_TRAIT: { type: GraphQLString },
        MAPPED_GENE: { type: GraphQLString },
        DATE: { type: GraphQLString },
        or_or_beta: { type: GraphQLString },
        strongest_snp_risk_allele: { type: GraphQLString },
        p_value: { type: GraphQLString },
        p_value_text: { type: GraphQLString },
        REGION: { type: GraphQLString },
        CHR_ID: { type: GraphQLInt },
        CHR_POS: { type: GraphQLInt },
        CONTEXT: { type: GraphQLString },
        p95_ci: { type: GraphQLString },
        date_added_to_catalog: { type: GraphQLString },
        first_author: { type: GraphQLString },
        JOURNAL: { type: GraphQLString },
        imputed: { type: new GraphQLObjectType({
            name: 'Imputed',
            fields: {
                tromso: { type: new GraphQLObjectType({
                    name: 'Tromso',
                    fields: {
                        REF: { type: GraphQLString },
                        ALT: { type: GraphQLString },
                        MAF: { type: GraphQLString },
                        AvgCall: { type: GraphQLFloat },
                        Rsq: { type: GraphQLFloat },
                        Genotyped: { type: GraphQLBoolean },
                        LooRsq: { type: GraphQLFloat },
                        EmpR: { type: GraphQLFloat },
                        EmpRsq: { type: GraphQLFloat },
                        Dose0: { type: GraphQLFloat },
                        Dose1: { type: GraphQLFloat },
                    },
                }) },
            },
        }) },
    },
    interfaces: [nodeInterface],
});

const userType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: globalIdField('User'),
        results: {
            type: connectionDefinitions({ name: 'Result', nodeType: resultType }).connectionType,
            args: {
                term: { type: GraphQLString },
                ...connectionArgs,
            },
            async resolve(term, { ...args }) { // term here is unused for now, coming from server
                if (!args.term || args.term.length < 3) {
                    return connectionFromArray([], args);
                }
                const query = prepareQuery(args.term);
                return await connectionFromMongooseQuery(
                    Result.find(query).limit(1000).sort('CHR_ID CHR_POS'),
                    args,
                );
            },
        },
        count: {
            type: GraphQLInt,
            args: {
                term: { type: GraphQLString },
            },
            resolve: (_, args) => Result.aggregate(
                { $match: prepareQuery(args.term) },
                { $group: { _id: '$SNP_ID_CURRENT', count: { $sum: 1 } } },
            ).exec().then(data => data.length),
        },
        traits: {
            type: new GraphQLList(traitType),
            resolve: () => Trait.find().exec(),
        },
    },
    interfaces: [nodeInterface],
});

// TODO: Use grouped data for variable ordering
const snpsPerTraitType = new GraphQLObjectType({
    name: 'SnpsPerTrait',
    fields: {
    },
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        viewer: {
            type: userType,
            resolve: (_) => _,
        },
    },
});

const schema = new GraphQLSchema({
    query: queryType,
});

export default schema;
