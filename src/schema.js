import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
    GraphQLInputObjectType,
} from 'graphql';

import {
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
} from 'graphql-relay';

import connectionFromMongooseQuery from 'relay-mongoose-connection';

import Result from './models/Result';

import { startsWith, endsWith, each, values } from 'lodash';

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
    }
    if (fields.length) {
        query.$or = fields;
    }
    if (tromso) {
        query.imputed = { $exists: 1 };
    }
    query['P-VALUE'] = { $lt: 0.00000005, $exists: 1, $ne: null };

    return query;
}

class ResultDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'Result') {
            return Result.findById(id).exec().then((result) => new ResultDTO(result.toObject()));
        }
    },
    (obj) => {
        if (obj instanceof ResultDTO) {
            return resultType;
        }
        return null;
    }
);

const resultType = new GraphQLObjectType({
    name: 'Result',
    fields: {
        id: globalIdField('Result'),
        SNP_ID_CURRENT: { type: GraphQLString },
        PUBMEDID: { type: GraphQLString },
        MAPPED_TRAIT: { type: GraphQLString },
    },
    interfaces: [nodeInterface],
});

const searchQueryType = new GraphQLObjectType({
    name: 'SearchQuery',
    fields: {
        id: globalIdField('SearchQuery'),
        term: { type: GraphQLString },
        results: {
            type: connectionDefinitions({ name: 'Result', nodeType: resultType }).connectionType,
            args: {
                ...connectionArgs,
            },
            async resolve(term, { ...args }) {
                return await connectionFromMongooseQuery(
                    Result.find(prepareQuery('foot')).limit(1000).sort('CHR_ID CHR_POS'),
                    args,
                );
            },
        },
        count: {
            type: GraphQLInt,
            args: {
                term: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            resolve: (_, args) => Result.aggregate(
                { $match: prepareQuery(args.term) },
                { $group: { _id: '$SNP_ID_CURRENT', count: { $sum: 1 } } },
            ).exec().then(data => data.length),
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
        searchQuery: {
            type: searchQueryType,
            resolve: (_) => _,
        },
    },
});

const schema = new GraphQLSchema({
    query: queryType,
});

export default schema;
