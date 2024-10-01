import fs from "fs";

// Mock fetch to just read the file synchronously
const mockFetch = async (url: RequestInfo | URL) => {
  try {
    const fileContent = fs.readFileSync(url as string);
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(fileContent.toString("utf-8")),
      text: async () => fileContent.toString("utf-8"),
      arrayBuffer: async () =>
        fileContent.buffer.slice(
          fileContent.byteOffset,
          fileContent.byteOffset + fileContent.byteLength
        ),
    };
  } catch (error) {
    return {
      ok: false,
      status: 404,
      json: async () => ({}),
      text: async () => "",
    };
  }
};

interface MockGlobal {
  fetch: typeof mockFetch;
}
(global as MockGlobal).fetch = mockFetch;
