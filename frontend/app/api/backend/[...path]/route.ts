export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  const backendUrl =
    `https://placementos-api-mgb.onrender.com/${path.join("/")}`;

  const body = await request.arrayBuffer();

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        request.headers.get("content-type") || "application/json",
    },
    body,
  });

  const responseBody = await response.arrayBuffer();

  return new Response(responseBody, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
    },
  });
}