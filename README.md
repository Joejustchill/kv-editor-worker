# KV Text Editor for Cloudflare Workers & Pages

A lightweight, self-hosted text storage and editing interface built with **Cloudflare Workers**, **Pages**, and **KV Storage**.  
It allows users to view and edit a single text file directly from the browser.

 
## 🌐 Live Demo

- View content: `https://editordemo.pages.dev/`
- Edit content: `https://editordemo.pages.dev/edit`

## 🧩 Features
- 📄 View previously saved text at `/`
- ✍️ Edit and save text via `/edit`
- 💾 Persistent storage using Cloudflare KV
- ⚡ Blazing fast and free to host via Cloudflare Pages
- 💡Inline auto-save (with debounce)
- 🗂️Responsive and minimal design


## 🚀 Deployment Instructions

### 1. Create the KV Namespace

- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Create a new KV namespace
- Use the name `TXTKV` (or any name you prefer)
- **Bind the namespace** in `pages > functions` with the binding name: `TXTKV`

### 2. Deploy via Pages Functions

- Upload the `_worker.js` file to your Cloudflare Pages project in the `functions` directory
- Structure:
📁 your-project/
├── functions/
│   └── _worker.js
├── README.md
└── wrangler.toml (if needed)

- Publish the project via Pages

### 3. Usage

- Go to `https://your-pages-domain.com` to view the text
- Go to `https://your-pages-domain.com/edit` to edit and save the content

## 🛠 Tech Stack

- Cloudflare Workers
- Cloudflare Pages
- Workers KV Storage
- Vanilla HTML, CSS, JavaScript

## 📌 Upcoming Features (Planned)

- 🧾 Version history / content backups
- 🧑‍💻 Password-protected edit access
- 🌐 Multi-file support (switch between different texts)
- ☁️ Import/export options (txt / md)
- 📱 Better mobile UI adaptation
- 🗂️ Tag or categorize saved texts

## 🔄 Changelog

<details>
  <summary>Click to view the changelog</summary>
- **2.0.0** (2025-05-07): 
	
✨ Features
	•	Added error handling with try-catch in all core functions.
	•	Introduced a top bar with title and Save button.
	•	Auto-save after 5s of inactivity or on blur.
	•	Visual status updates (Editing…, Saved ✔️, Failed ❌).

🎨 UI Improvements
	•	Dark theme with modern styling.
	•	Monospace font and padding for better editing experience.
	•	Styled buttons with hover effects.

🛠️ Enhancements
	•	Unified KV namespace checks.
	•	Escaped < in text content to avoid HTML issues.
	•	Cleaner separation between backend logic and frontend UI.
- **1.0.0** (2025-04-06): Initial Release
</details>

## 📄 License

This project is licensed under the MIT License. See [MIT](./LICENSE)for details.

---

Made with ☁️ by Joejustchill

