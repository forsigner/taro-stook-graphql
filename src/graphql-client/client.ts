import { getTaro } from "./getTaro";
import { Options, Variables } from "./typings";

export class GraphQLClient {
  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  async query<T = any>(input: string, variables?: Variables): Promise<T> {
    const { endpoint, headers } = this.options;
    const body = { query: input, variables };
    try {
      // const res = await request(endpoint, { method: 'POST', body, ...rest })
      const response = await getTaro().request({
        method: "POST",
        url: endpoint,
        data: body,
        header: headers || {}
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data: T = response.data.data;
        return data;
      } else {
        throw response;
      }
    } catch (error) {
      throw error;
    }
  }
}

export async function query<T = any>(
  endpoint: string,
  input: string,
  variables?: Variables
): Promise<T> {
  const client = new GraphQLClient({ endpoint });
  return client.query<T>(input, variables);
}
