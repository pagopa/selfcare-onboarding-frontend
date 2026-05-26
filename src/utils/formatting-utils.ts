export const formatCity = (city: string): string =>
  city
    .charAt(0)
    .toUpperCase()
    .concat(city.substring(1).toLowerCase().replace('- comune', '').trim());

export const fileFromReader = async (
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined
): Promise<string> => {
  const stream = new ReadableStream({
    start(controller) {
      return pump();
      function pump(): Promise<any> | undefined {
        return reader?.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          return pump();
        });
      }
    },
  });
  const response = new Response(stream);

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
