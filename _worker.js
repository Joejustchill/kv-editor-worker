export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);

            if (url.pathname === '/edit') {
                // Handle /edit path request
                const html = await KV(request, env);
                return html;
            } else if (url.pathname === '/') {
                // Handle root path request
                const content = await getContent(env);
                return new Response(content, { headers: { 'content-type': 'text/plain;charset=utf-8' } });
            } else {
                // Return 404 for other paths
                return new Response('Not Found', { status: 404 });
            }
        } catch (err) {
            let e = err;
            return new Response(e.toString());
        }
    },
};

async function getContent(env, txt = 'ADD.txt') {
    try {
        if (!env.TXTKV) return "KV namespace not bound";
        return await env.TXTKV.get(txt) || '';
    } catch (error) {
        console.error('Error reading KV:', error);
        return 'Error retrieving data: ' + error.message;
    }
}


async function KV(request, env, txt = 'ADD.txt') {
    try {
        // Handle POST request
        if (request.method === "POST") {
            if (!env.TXTKV) return new Response("KV namespace not bound", { status: 400 });
            try {
                const content = await request.text();
                await env.TXTKV.put(txt, content);
                return new Response("Saved successfully");
            } catch (error) {
                console.error('Error saving KV:', error);
                return new Response("Save failed: " + error.message, { status: 500 });
            }
        }

        // Handle GET request
        let content = '';
        let hasKV = !!env.TXTKV;

        if (hasKV) {
            try {
                content = await env.TXTKV.get(txt) || '';
            } catch (error) {
                console.error('Error reading KV:', error);
                content = 'Error retrieving data: ' + error.message;
            }
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cloud Text Editor</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        box-sizing: border-box;
                        font-size: 13px;
                        height: 100vh;
                        overflow: hidden;
                        background: #111;
                    }
                    .editor-container {
                        width: 100%;
                        max-width: 100%;
                        margin: 0 auto;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }
                    .editor {
                        flex: 1;
                        padding: 1.2em 1.6em 1.6em 1.6em;
                        box-sizing: border-box;
                        border: none;
                        border-radius: 4px;
                        font-size: 15px;
                        line-height: 1.4;
                        overflow-y: auto;
                        resize: none;
                        background: #111;
                        color: #eee;
                        font-family: monospace;
                        outline: none;
                    }
                    .save-container {
                        padding: 16px 24px 24px 24px !important;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 20px 16px 32px 16px;
                        background: #222;
                        font-family: monospace;
                    }
                    .save-btn, .back-btn {
                        padding: 6px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                    }
                    .save-btn {
                        background: #3286FB;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        color: #F9F9F9;
                    }
                    .save-btn:hover {
                        background: #65A6FC;
                    }
                    .back-btn {
                        background: #35363C;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        color: #F9F9F9;
                    }
                    .back-btn:hover {
                        background: #43444A;
                        color: #F9F9F9f;
                    }
                    .save-status {
                        color: #666;
                    }
                    .notice-content {
                        display: none;
                        margin-top: 10px;
                        font-size: 13px;
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="editor-container">
                    ${hasKV ? `
                    <textarea class="editor" 
  placeholder="${decodeURIComponent(atob('V2VsY29tZSB0byBZb3VyIENsb3VkIFRleHQgRWRpdG9yIQ0KDQpUaGlzIGlzIGEgc2ltcGxlLCBzZWxmLWhvc3RlZCB3ZWIgZWRpdG9yIHBvd2VyZWQgYnkgQ2xvdWRmbGFyZSBXb3JrZXJzIGFuZCBLViBTdG9yYWdlLg0KDQpZb3UgY2FuIHVzZSB0aGlzIHNwYWNlIHRvOg0KLSBUYWtlIHF1aWNrIG5vdGVzDQotIFN0b3JlIHByb2plY3QgaWRlYXMNCi0gS2VlcCBhIHNoYXJlZCB0by1kbyBsaXN0DQotIFdyaXRlIGFueXRoaW5nLCBpbnN0YW50bHkgYW5kIGFueXdoZXJlDQoNClNhdmluZ3MgYXJlIHNhdmVkIGF1dG9tYXRpY2FsbHkuICANCkNsaWNrIGAvZWRpdGAgaW4gdGhlIFVSTCB0byBzd2l0Y2ggdG8gZWRpdCBtb2RlLg0KDQpCdWlsdCBmb3Igc3BlZWQsIHByaXZhY3ksIGFuZCBzaW1wbGljaXR5Lg=='))}" 
  id="content">${content}</textarea>
                    <div class="save-container">
                        <button class="back-btn" onclick="goBack()">Back</button>
                        <button class="save-btn" onclick="saveContent(this)">Save</button>
                        <span class="save-status" id="saveStatus"></span>
                    </div>
                    ` : '<p>KV namespace not bound</p>'}
                </div>
        
                <script>
                if (document.querySelector('.editor')) {
                    let timer;
                    const textarea = document.getElementById('content');
                    const originalContent = textarea.value;
        
                    function goBack() {
                        window.location.href = "/";
                    }
        
                    function replaceFullwidthColon() {
                        const text = textarea.value;
                        textarea.value = text.replace(/：/g, ':');
                    }
                    
                    function saveContent(button) {
                        try {
                            const updateButtonText = (step) => {
                                button.textContent = \`Saving: \${step}\`;
                            };
                            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                            
                            if (!isIOS) {
                                replaceFullwidthColon();
                            }
                            updateButtonText('Starting');
                            button.disabled = true;
                            const textarea = document.getElementById('content');
                            if (!textarea) {
                                throw new Error('Editor not found');
                            }
                            updateButtonText('Getting content');
                            let newContent;
                            let originalContent;
                            try {
                                newContent = textarea.value || '';
                                originalContent = textarea.defaultValue || '';
                            } catch (e) {
                                console.error('Content error:', e);
                                throw new Error('Unable to get content');
                            }
                            updateButtonText('Preparing status updater');
                            const updateStatus = (message, isError = false) => {
                                const statusElem = document.getElementById('saveStatus');
                                if (statusElem) {
                                    statusElem.textContent = message;
                                    statusElem.style.color = isError ? 'red' : '#666';
                                }
                            };
                            updateButtonText('Preparing button reset');
                            const resetButton = () => {
                                button.textContent = 'Save';
                                button.disabled = false;
                            };
                            if (newContent !== originalContent) {
                                updateButtonText('Sending save request');
                                fetch(window.location.href, {
                                    method: 'POST',
                                    body: newContent,
                                    headers: {
                                        'Content-Type': 'text/plain;charset=UTF-8'
                                    },
                                    cache: 'no-cache'
                                })
                                .then(response => {
                                    updateButtonText('Checking response');
                                    if (!response.ok) {
                                        throw new Error(\`HTTP error! status: \${response.status}\`);
                                    }
                                    updateButtonText('Updating status');
                                    const now = new Date().toLocaleString();
                                    document.title = \`Saved \${now}\`;
                                    updateStatus(\`Saved \${now}\`);
                                })
                                .catch(error => {
                                    updateButtonText('Handling error');
                                    console.error('Save error:', error);
                                    updateStatus(\`Save failed: \${error.message}\`, true);
                                })
                                .finally(() => {
                                    resetButton();
                                });
                            } else {
                                updateButtonText('Checking for changes');
                                updateStatus('No changes');
                                resetButton();
                            }
                        } catch (error) {
                            console.error('Save error:', error);
                            button.textContent = 'Save';
                            button.disabled = false;
                            const statusElem = document.getElementById('saveStatus');
                            if (statusElem) {
                                statusElem.textContent = \`Error: \${error.message}\`;
                                statusElem.style.color = 'red';
                            }
                        }
                    }
        
                    textarea.addEventListener('blur', saveContent);
                    textarea.addEventListener('input', () => {
                        clearTimeout(timer);
                        timer = setTimeout(saveContent, 5000);
                    });
                }
        
                function toggleNotice() {
                    const noticeContent = document.getElementById('noticeContent');
                    const noticeToggle = document.getElementById('noticeToggle');
                    if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
                        noticeContent.style.display = 'block';
                        noticeToggle.textContent = 'Notice ∧';
                    } else {
                        noticeContent.style.display = 'none';
                        noticeToggle.textContent = 'Notice ∨';
                    }
                }
        
                document.addEventListener('DOMContentLoaded', () => {
                    document.getElementById('noticeContent').style.display = 'none';
                });
                </script>
            </body>
            </html>
        `;

        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=utf-8" }
        });
    } catch (error) {
        console.error('Error handling request:', error);
        return new Response("Server Error: " + error.message, {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
    }
}
