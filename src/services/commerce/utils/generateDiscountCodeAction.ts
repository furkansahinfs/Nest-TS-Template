import {
  CartAddDiscountCodeAction,
  CartRemoveDiscountCodeAction,
} from "@commercetools/platform-sdk";

export const generateAddDiscountCodeAction = (
  discountCode: string,
): CartAddDiscountCodeAction => {
  const addDiscountCodeAction: CartAddDiscountCodeAction = {
    code: discountCode,
    action: "addDiscountCode",
  };

  return addDiscountCodeAction;
};

export const generateRemoveDiscountCodeAction = (
  discountCodeId: string,
): CartRemoveDiscountCodeAction => {
  const removeDiscountCodeAction: CartRemoveDiscountCodeAction = {
    discountCode: { id: discountCodeId, typeId: "discount-code" },
    action: "removeDiscountCode",
  };

  return removeDiscountCodeAction;
};
