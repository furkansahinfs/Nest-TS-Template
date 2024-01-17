import {
  ClientResponse,
  Customer,
  CustomerDraft,
  CustomerUpdateAction,
} from "@commercetools/platform-sdk";
import { CTApiRoot } from "../CTApiRoot";
import { ICTCustomerSDK } from "./ct.customer.sdk.interface";

export class CTCustomerSDK implements ICTCustomerSDK {
  async findCustomers({ where, limit, offset }) {
    return await CTApiRoot.customers()
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
    const customerByIdResponse = await CTApiRoot.customers()
      .withId({ ID: customerId })
      .get()
      .execute();
    return customerByIdResponse.body ?? undefined;
  }

  async findCustomerByCustomerNumber(
    customerNumber: string,
  ): Promise<Customer> {
    const where = `customerNumber="${customerNumber}"`;

    const customerByCustomerNumberResponse = await this.findCustomers({
      where: where,
      limit: 1,
      offset: 0,
    });

    return customerByCustomerNumberResponse.body.results[0] ?? undefined;
  }

  async createCustomer(customerDraft: CustomerDraft) {
    return await CTApiRoot.customers().post({ body: customerDraft }).execute();
  }

  async updateCustomer(
    customerId: string,
    customerUpdateActions: CustomerUpdateAction[],
  ): Promise<ClientResponse<Customer>> {
    const customer = await this.findCustomerById(customerId);

    return await CTApiRoot.customers()
      .withId({ ID: customerId })
      .post({
        body: { actions: customerUpdateActions, version: customer.version },
      })
      .execute();
  }
}
