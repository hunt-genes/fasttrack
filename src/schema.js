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
} from 'graphql-relay';

import Result from './models/Result';

class ResultDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'Result') {
            return Result.findById(id).exec().then((result) => new ResultDTO(result.toObject()));
        }
    },
    (obj) => {
        if (obj instanceof UserDTO) {
            return userType;
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

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        results: {
            type: resultType,
            resolve: ({ query }) => Result.find().limit(10),
        },
    },
});

const schema = new GraphQLSchema({
    query: queryType,
});

export default schema;
