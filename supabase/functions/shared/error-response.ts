export function errorResponse(message: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    }
  );
} 