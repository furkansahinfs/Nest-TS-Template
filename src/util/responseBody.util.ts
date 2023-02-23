export function ResponseBody() {
  const response = {
    message: undefined,
    data: undefined,
  };

  return {
    message: function (message: any) {
      response.message = message;
      return this;
    },
    data: function (data: any) {
      response.data = data;
      return this;
    },
    build: function () {
      return response;
    },
  };
}
