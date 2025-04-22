export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);

            if (url.pathname === '/edit') {
                const html = await KV(request, env);
                return html;
            } else if (url.pathname === '/') {
                const content = await getContent(env);
                return new Response(content, { headers: { 'content-type': 'text/plain;charset=utf-8' } });
            } else {
                return new Response('Not Found', { status: 404 });
            }
        } catch (err) {
            return new Response(err.toString());
        }
    },
};

async function getContent(env, txt = 'ADD.txt') {
    try {
        if (!env.TXTKV) return "KV namespace not bound.";
        return await env.TXTKV.get(txt) || '';
    } catch (error) {
        console.error('Error reading from KV:', error);
        return 'Error fetching data: ' + error.message;
    }
}

async function KV(request, env, txt = 'ADD.txt') {
    try {
        if (request.method === "POST") {
            if (!env.TXTKV) return new Response("KV namespace not bound.", { status: 400 });
            try {
                const content = await request.text();
                await env.TXTKV.put(txt, content);
                return new Response("Saved successfully.");
            } catch (error) {
                console.error('Error saving to KV:', error);
                return new Response("Save failed: " + error.message, { status: 500 });
            }
        }

        let content = '';
        let hasKV = !!env.TXTKV;

        if (hasKV) {
            try {
                content = await env.TXTKV.get(txt) || '';
            } catch (error) {
                console.error('Error reading KV:', error);
                content = 'Error reading data: ' + error.message;
            }
        }

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KV Editor</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #1a1a1a;
      color: #eaeaea;
      font-family: "Segoe UI", sans-serif;
    }
    textarea {
      width: 100%;
      height: 92vh;
      background: #111;
      color: #eee;
      font-family: monospace;
      font-size: 15px;
      line-height: 1.4;
      padding: 1em;
      box-sizing: border-box;
      border: none;
      resize: none;
      outline: none;
    }
    .status {
      font-size: 13px;
      color: #888;
      padding: 0.5em 1em;
    }
    .topbar {
      padding: 0.7em 1em;
      font-size: 15px;
      background: #222;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    button {
      background: #444;
      color: #eee;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      background: #666;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div>KV Editor</div>
    <button onclick="save()">Save</button>
  </div>
  <textarea id="editor" placeholder="Loading...">${content.replace(/</g, '&lt;')}</textarea>
  <div class="status" id="status"></div>
  <script>
    const textarea = document.getElementById("editor");
    const status = document.getElementById("status");

    let timeout;
    textarea.addEventListener("input", () => {
      clearTimeout(timeout);
      status.textContent = "Editing...";
      timeout = setTimeout(save, 5000);
    });

    textarea.addEventListener("blur", () => {
      clearTimeout(timeout);
      save();
    });

    async function save() {
      const content = textarea.value;
      status.textContent = "Saving...";
      try {
        const res = await fetch("/edit", {
          method: "POST",
          body: content,
        });
        const txt = await res.text();
        status.textContent = "Saved ✔️";
      } catch (e) {
        status.textContent = "Failed to save ❌";
      }
    }
  </script>
</body>
</html>`;
        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=utf-8" }
        });
    } catch (error) {
        console.error('Request error:', error);
        return new Response("Server error: " + error.message, {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
    }
}
