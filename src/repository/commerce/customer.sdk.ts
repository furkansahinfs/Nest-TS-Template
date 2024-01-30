import {
  ClientResponse,
  Customer,
  CustomerDraft,
  CustomerPagedQueryResponse,
  CustomerSignInResult,
  CustomerUpdateAction,
} from "@commercetools/platform-sdk";
import { CTCustomerSDK } from "./customer.sdk.interface";
import { CTApiRoot } from "src/commercetools";

export class CTCustomerSDKImpl implements CTCustomerSDK {
  async findCustomers({
    where,
    limit,
    offset,
  }): Promise<ClientResponse<CustomerPagedQueryResponse>> {
    return CTApiRoot.customers()
      .get({
        queryArgs: {
          limit,
          offset,
          where,
        },
      })
      .execute();
  }

  async findCustomerById(customerId: string): Promise<Customer> {
    const customerByIdResponse: ClientResponse<Customer> =
      await CTApiRoot.customers().withId({ ID: customerId }).get().execute();
    return customerByIdResponse.body ?? undefined;
  }

  async findCustomerByCustomerNumber(
    customerNumber: string,
  ): Promise<Customer> {
    const where = `customerNumber="${customerNumber}"`;

    const customerByCustomerNumberResponse: ClientResponse<CustomerPagedQueryResponse> =
      await this.findCustomers({
        where: where,
        limit: 1,
        offset: 0,
      });

    return customerByCustomerNumberResponse.body.results[0] ?? undefined;
  }

  async createCustomer(
    customerDraft: CustomerDraft,
  ): Promise<ClientResponse<CustomerSignInResult>> {
    return CTApiRoot.customers().post({ body: customerDraft }).execute();
  }

  async updateCustomer(
    customerId: string,
    customerUpdateActions: CustomerUpdateAction[],
  ): Promise<ClientResponse<Customer>> {
    const customer: Customer = await this.findCustomerById(customerId);

    return CTApiRoot.customers()
      .withId({ ID: customerId })
      .post({
        body: { actions: customerUpdateActions, version: customer.version },
      })
      .execute();
  }
}
