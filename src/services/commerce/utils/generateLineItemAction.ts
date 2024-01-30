import {
  CartAddLineItemAction,
  CartChangeLineItemQuantityAction,
  CartRemoveLineItemAction,
} from "@commercetools/platform-sdk";

export const generateAddLineItemAction = (
  lineItemSKU: string,
): CartAddLineItemAction => {
  const addLineItemAction: CartAddLineItemAction = {
    action: "addLineItem",
    sku: lineItemSKU,
    quantity: 1,
  };

  return addLineItemAction;
};

export const generateRemoveLineItemAction = (
  lineItemId: string,
): CartRemoveLineItemAction => {
  const removeLineItemAction: CartRemoveLineItemAction = {
    action: "removeLineItem",
    lineItemId,
  };

  return removeLineItemAction;
};

export const generateChangeineItemQuantityAction = (
  lineItemId: string,
  quantity: number,
): CartChangeLineItemQuantityAction => {
  const changeLineItemQuantityAction: CartChangeLineItemQuantityAction = {
    action: "changeLineItemQuantity",
    lineItemId,
    quantity,
  };

  return changeLineItemQuantityAction;
};
