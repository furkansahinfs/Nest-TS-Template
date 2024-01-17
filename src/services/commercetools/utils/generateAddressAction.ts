import {
  AddressDraft,
  CartSetBillingAddressAction,
  CartSetShippingAddressAction,
} from "@commercetools/platform-sdk";

export const generateAddressAction = (
  address: AddressDraft,
  type: "SHIPPING" | "BILLING",
): CartSetShippingAddressAction | CartSetBillingAddressAction => {
  const setAdressAction:
    | CartSetShippingAddressAction
    | CartSetBillingAddressAction = {
    address: address,
    action: type === "SHIPPING" ? "setShippingAddress" : "setBillingAddress",
  };

  return setAdressAction;
};
