  
# KV Editor Worker

A lightweight key-value based text viewer and editor built with **Cloudflare Workers**, **Pages**, and **KV Storage**.

## ✨ Features

- 📄 View previously saved text at `/`
- ✍️ Edit and save text via `/edit`
- 💾 Persistent storage using Cloudflare KV
- ⚡ Blazing fast and free to host via Cloudflare Pages

---

## 🚀 Deployment Steps

### 1. Upload to Cloudflare Pages

- Copy the `src/index.js` file as `_worker.js`
- Upload `_worker.js` to a new Cloudflare Pages project using the **"Functions"** feature

### 2. Create a KV Namespace

- Go to your Cloudflare dashboard → **Workers** → **KV**
- Click **"Create namespace"**
- Name it `TXTKV` (or any name you prefer)

### 3. Bind the KV Namespace to your Pages Project

- Go to **Pages** → Your project → **Settings** → **Functions** → **KV bindings**
- Add a new KV binding:
  - **Binding name**: `TXTKV`
  - **KV namespace**: Select the one you just created

---

## 💡 Usage

- Visit `https://<your-pages-domain>/` to view the current saved text
- Visit `https://<your-pages-domain>/edit` to open the editor
- Text updates are stored in KV storage under the key `"txt"`

---

## 📁 Project Structure

kv-editor-worker/
├── LICENSE
├── README.md
└── _worker.js


## 📜 License

[MIT](./LICENSE)
