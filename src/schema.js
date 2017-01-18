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
  mutationWithClientMutationId,
} from 'graphql-relay';

import connectionFromMongooseQuery from 'relay-mongoose-connection';
import GraphQLDate from 'graphql-custom-datetype';

import ip from 'ip';

import Result from './models/Result';
import Trait from './models/Trait';
import Request from './models/Request';
import Order from './models/Order';
import Site from './models/Site';
import prepareQuery from './models/prepareQuery';

class ResultDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class UserDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class SiteDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

let resultType;
let userType;
let siteType;

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'Result') {
            return Result.findById(id).exec().then((result) => new ResultDTO(result.toObject()));
        }
        if (type === 'User') {
            return new UserDTO({});
        }
        if (type === 'Site') {
            return new SiteDTO({});
        }
    },
    (obj) => {
        if (obj instanceof ResultDTO) {
            return resultType;
        }
        if (obj instanceof UserDTO) {
            return userType;
        }
        if (obj instanceof SiteDTO) {
            return siteType;
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

const orderType = new GraphQLObjectType({
    name: 'Order',
    fields: {
        id: globalIdField('Order'),
        email: { type: GraphQLString },
        snps: { type: new GraphQLList(GraphQLString) },
        createdAt: { type: GraphQLDate },
    },
});

resultType = new GraphQLObjectType({
    name: 'Result',
    fields: {
        id: globalIdField('Result'),
        snp_id_current: {
            type: GraphQLInt,
            resolve: ({ snp_id_current }) => {
                if (snp_id_current) {
                    return parseInt(snp_id_current, 10);
                }
                return null;
            }
        },
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
        chr_id: { type: GraphQLString },
        chr_pos: { type: GraphQLInt },
        context: { type: GraphQLString },
        p95_ci: { type: GraphQLString },
        date_added_to_catalog: { type: GraphQLString },
        first_author: { type: GraphQLString },
        journal: { type: GraphQLString },
        disease_trait: { type: GraphQLString },
        traits: { type: new GraphQLList(GraphQLString) },
        genes: { type: new GraphQLList(GraphQLString) },
        tromso: { type: new GraphQLList(new GraphQLObjectType({
            name: 'Tromso',
            fields: {
                ref: { type: GraphQLString },
                alt: { type: GraphQLString },
                maf: { type: GraphQLFloat },
                avgcall: { type: GraphQLFloat },
                rsq: { type: GraphQLFloat },
                genotyped: { type: GraphQLBoolean },
                imputed: { type: GraphQLBoolean },
            },
        })) },
        hunt: { type: new GraphQLList(new GraphQLObjectType({
            name: 'Hunt',
            fields: {
                ref: { type: GraphQLString },
                alt: { type: GraphQLString },
                maf: { type: GraphQLFloat },
                avgcall: { type: GraphQLFloat },
                rsq: { type: GraphQLFloat },
                genotyped: { type: GraphQLBoolean },
                imputed: { type: GraphQLBoolean },
            },
        })) },
    },
    interfaces: [nodeInterface],
});

const resultConnection = connectionDefinitions({
    name: 'Result',
    nodeType: resultType,
});

userType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: globalIdField('User'),
        results: {
            type: resultConnection.connectionType,
            args: {
                term: { type: GraphQLString },
                unique: { type: GraphQLBoolean },
                tromso: { type: GraphQLBoolean },
                hunt: { type: GraphQLBoolean },
                ...connectionArgs,
            },
            resolve: (term, args) => { // term here is unused for now, coming from server
                if (!args.term || args.term.length < 3) {
                    return connectionFromArray([], args);
                }
                const query = prepareQuery(args.term, args.unique, args.tromso, args.hunt);
                return connectionFromMongooseQuery(
                    Result.find(query).sort('sortable_chr_id chr_pos'),
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
                tromso: { type: GraphQLBoolean },
                hunt: { type: GraphQLBoolean },
            },
            resolve: (_, args) => Result.aggregate(
                { $match: prepareQuery(args.term, null, args.tromso, args.hunt) },
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
            resolve: () => Trait.find().sort('_id').exec(),
        },
        requests: {
            type: new GraphQLObjectType({
                name: 'Requests',
                fields: {
                    local: { type: GraphQLInt },
                    total: { type: GraphQLInt },
                },
            }),
            resolve: () => Request.count().exec().then(
                total => {
                    const localStart = ip.toBuffer('129.241.0.0');
                    const localEnd = ip.toBuffer('129.241.255.255');
                    return Request.count({
                        $and: [
                            { remote_address: { $gte: localStart } },
                            { remote_address: { $lte: localEnd } },
                        ],
                    }).exec().then(local => {
                        return {
                            total,
                            local,
                        };
                    });
                }),
        },
    },
    interfaces: [nodeInterface],
});

siteType = new GraphQLObjectType({
    name: 'Site',
    fields: () => ({
        id: globalIdField('Site'),
        order: { type: orderType },
    }),
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        viewer: {
            type: userType,
            resolve: (_) => _,
        },
        site: {
            type: siteType,
            resolve: ({ site }) => site,
        }
    },
});

const mutationOrderVariables = mutationWithClientMutationId({
    name: 'OrderVariables',
    inputFields: {
        snps: { type: new GraphQLList(GraphQLString) },
        email: { type: GraphQLString },
    },
    outputFields: {
        site: {
            type: siteType,
            resolve: payload => payload,
        },
    },
    mutateAndGetPayload: ({ snps, email }, { site }) => {
        // TODO: Check email
        return Site.findById(site.id).exec().then(site => {
            return Order.create({ snps, email }).then(order => {
                site.order = order;
                return site;
            });
        });
    },
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        orderVariables: mutationOrderVariables,
    }),
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});

export default schema;
