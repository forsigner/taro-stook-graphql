import { GraphQLClient } from "./graphql-client";
import { GraphqlConfig, Options } from "./types";

const NULL_AS: any = null;

const clients = {
  graphqlClient: NULL_AS as GraphQLClient,
  setupGraphqlClient(options: GraphqlConfig) {
    const { endpoint } = options;
    const defaultOpt = { headers: {} };
    let opt: Options = options || defaultOpt;
    clients.graphqlClient = new GraphQLClient({
      endpoint,
      headers: opt.headers as any
    });
  }
};
export default clients;
