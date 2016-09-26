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
            fields.push({ pubmedid: q });
            fields.push({ snps: 'rs' + q });
        }
        else if (chrSearch) {
            const [_, chrid, chrpos] = chrSearch;
            query.chr_id = +chrid;
            query.chr_pos = +chrpos;
        }
        else if (startsWith(q, 'rs')) {
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

        query.p_value = { $lt: 0.00000005, $exists: true, $ne: null };
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
        snp_id_current: { type: GraphQLString },
        snps: { type: GraphQLString },
        pubmedid: { type: GraphQLString },
        mapped_trait: { type: GraphQLString },
        mapped_gene: { type: GraphQLString },
        date: { type: GraphQLString },
        or_or_beta: { type: GraphQLString },
        strongest_snp_risk_allele: { type: GraphQLString },
        p_value: { type: GraphQLString },
        p_value_text: { type: GraphQLString },
        region: { type: GraphQLString },
        chr_id: { type: GraphQLInt },
        chr_pos: { type: GraphQLInt },
        context: { type: GraphQLString },
        p95_ci: { type: GraphQLString },
        date_added_to_catalog: { type: GraphQLString },
        first_author: { type: GraphQLString },
        journal: { type: GraphQLString },
        traits: { type: new GraphQLList(GraphQLString) },
        genes: { type: new GraphQLList(GraphQLString) },
        tromso: { type: new GraphQLObjectType({
            name: 'Tromso',
            fields: {
                ref: { type: GraphQLString },
                alt: { type: GraphQLString },
                maf: { type: GraphQLString },
                avgcall: { type: GraphQLFloat },
                rsq: { type: GraphQLFloat },
                genotyped: { type: GraphQLBoolean },
            },
        }) },
        hunt: { type: new GraphQLObjectType({
            name: 'Hunt',
            fields: {
                ref: { type: GraphQLString },
                alt: { type: GraphQLString },
                maf: { type: GraphQLString },
                avgcall: { type: GraphQLFloat },
                rsq: { type: GraphQLFloat },
                genotyped: { type: GraphQLBoolean },
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
        stats: {
            type: new GraphQLObjectType({
                name: 'Stats',
                fields: {
                    unique: { type: GraphQLInt },
                    total: { type: GraphQLInt },
                },
            }),
            args: {
                term: { type: GraphQLString },
            },
            resolve: (_, args) => Result.aggregate(
                { $match: prepareQuery(args.term) },
                { $group: { _id: '$snp_id_current', count: { $sum: 1 } } },
            ).exec().then(count => {
                const total = count.reduce((previous, current) => {
                    return previous + current.count;
                }, 0);
                const unique = count.length;
                return {
                    unique,
                    total,
                };
            }),
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
