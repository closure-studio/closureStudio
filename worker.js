// worker.js (直接放在 repo 根目录)
export default {
  async fetch(request) {
    const allowedOrigins = [
      "https://closure.ltsc.vip",
      "https://127.0.0.1:5173"
    ];
    const origin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
      "Access-Control-Allow-Methods": "GET",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 这个值会被 CI/CD 自动替换成 number
    const version = VITE_APP_VERSION_PLACEHOLDER;

    return new Response(JSON.stringify({ version }), { headers: corsHeaders });
  },
};
