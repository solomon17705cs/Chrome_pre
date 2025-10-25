const promptHandler = new PromptAPIHandler();
const summarizerHandler = new SummarizerAPIHandler();
const writerHandler = new WriterAPIHandler();
const rewriterHandler = new RewriterAPIHandler();

let currentTab = 'chat';

async function initializeApp() {
  await checkAllAPIs();
  setupEventListeners();
}

async function checkAllAPIs() {
  const promptAvailability = await promptHandler.checkAvailability();
  const summarizerAvailability = await summarizerHandler.checkAvailability();
  const writerAvailability = await writerHandler.checkAvailability();
  const rewriterAvailability = await rewriterHandler.checkAvailability();

  // Since all APIs use the same underlying model (Gemini Nano), their availability should be the same.
  // For robustness, you could check if all are the same or take the "worst" status.
  if (promptAvailability === 'available') {
    updateModelStatus('Ready', 'ready');
  } else if (promptAvailability === 'downloadable' || promptAvailability === 'downloading') {
    updateModelStatus('Downloading...', 'downloadable'); // or use a new 'downloading' class if you want
  } else {
    updateModelStatus('Unavailable', 'unavailable');
    showError('AI APIs are not available in this browser. Please ensure you meet the requirements.');
  }
}

function updateModelStatus(text, status = '') {
  const statusElement = document.getElementById('modelStatus');
  const statusDot = statusElement.querySelector('.status-dot');
  const statusText = statusElement.querySelector('.status-text');

  statusText.textContent = text;

  statusDot.className = 'status-dot';
  if (status) {
    statusDot.classList.add(status);
  }
}

function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.addEventListener('click', handleChatSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  });

  const attachBtn = document.getElementById('attachBtn');
  attachBtn.addEventListener('click', toggleFileUpload);

  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', handleFileSelect);

  const summarizeBtn = document.getElementById('summarizeBtn');
  summarizeBtn.addEventListener('click', handleSummarize);

  const writeBtn = document.getElementById('writeBtn');
  writeBtn.addEventListener('click', handleWrite);

  const rewriteBtn = document.getElementById('rewriteBtn');
  rewriteBtn.addEventListener('click', handleRewrite);

  document.getElementById('summaryType').addEventListener('change', handleSummarizerConfigChange);
  document.getElementById('summaryLength').addEventListener('change', handleSummarizerConfigChange);
  document.getElementById('summaryFormat').addEventListener('change', handleSummarizerConfigChange);

  document.getElementById('writerTone').addEventListener('change', handleWriterConfigChange);
  document.getElementById('writerLength').addEventListener('change', handleWriterConfigChange);
  document.getElementById('writerFormat').addEventListener('change', handleWriterConfigChange);

  document.getElementById('rewriterTone').addEventListener('change', handleRewriterConfigChange);
  document.getElementById('rewriterLength').addEventListener('change', handleRewriterConfigChange);
  document.getElementById('rewriterFormat').addEventListener('change', handleRewriterConfigChange);
}

function switchTab(tab) {
  currentTab = tab;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tab}-tab`);
  });
}

function switchMode(mode) {
  promptHandler.setMode(mode);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function toggleFileUpload() {
  const fileUploadArea = document.getElementById('fileUploadArea');
  const attachBtn = document.getElementById('attachBtn');

  const isVisible = fileUploadArea.style.display !== 'none';
  fileUploadArea.style.display = isVisible ? 'none' : 'block';
  attachBtn.classList.toggle('active', !isVisible);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  const filePreview = document.getElementById('filePreview');

  files.forEach(file => {
    promptHandler.addFile(file);

    const previewItem = document.createElement('div');
    previewItem.className = 'file-preview-item';

    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      previewItem.appendChild(img);
    }

    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    previewItem.appendChild(fileName);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
      const index = Array.from(filePreview.children).indexOf(previewItem);
      promptHandler.removeFile(index);
      previewItem.remove();
    };
    previewItem.appendChild(removeBtn);

    filePreview.appendChild(previewItem);
  });
}

async function handleChatSend() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;

  addMessage('user', message);
  input.value = '';

  const messagesContainer = document.getElementById('chatMessages');
  const assistantMessage = document.createElement('div');
  assistantMessage.className = 'message assistant';
  assistantMessage.innerHTML = `
    <div class="message-header">Assistant</div>
    <div class="message-content"><span class="loading"></span> Thinking...</div>
  `;
  messagesContainer.appendChild(assistantMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const stream = await promptHandler.promptStreaming(message);
    let fullResponse = '';

    // Accumulate full response (required for JSON parsing)
    for await (const chunk of stream) {
      fullResponse += chunk;
    }

    const contentDiv = assistantMessage.querySelector('.message-content');

    // Handle Mind Map mode separately (JSON)
    if (promptHandler.currentMode === 'mindmap') {
      try {
        const mindMapData = JSON.parse(fullResponse.trim());
        const formatted = renderMindMapFromJSON(mindMapData);
        contentDiv.innerHTML = '';
        contentDiv.appendChild(formatted);
      } catch (parseError) {
        console.error('JSON parse failed:', parseError, 'Raw response:', fullResponse);
        contentDiv.innerHTML = `<div class="error-message">Failed to generate mind map. Please try a more specific topic.</div>`;
      }
    } else {
      // For all other modes: use incremental-compatible string output
      const formatted = formatPromptOutput(fullResponse, promptHandler.currentMode);
      contentDiv.innerHTML = '';
      contentDiv.appendChild(formatted);
    }

    // Cleanup
    promptHandler.clearFiles();
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('fileUploadArea').style.display = 'none';
    document.getElementById('attachBtn').classList.remove('active');

  } catch (error) {
    assistantMessage.querySelector('.message-content').innerHTML = 
      `<div class="error-message">Error: ${error.message}</div>`;
    showError(`Failed to get response: ${error.message}`);
  } finally {
    sendBtn.disabled = false;
  }
}

function addMessage(role, content) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  const header = role === 'user' ? 'You' : 'Assistant';

  messageDiv.innerHTML = `
    <div class="message-header">${header}</div>
    <div class="message-content">${escapeHtml(content)}</div>
  `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleSummarizerConfigChange() {
  const type = document.getElementById('summaryType').value;
  const length = document.getElementById('summaryLength').value;
  const format = document.getElementById('summaryFormat').value;

  const needsRecreate = summarizerHandler.updateOptions({ type, length, format });

  if (needsRecreate && summarizerHandler.summarizer) {
    summarizerHandler.destroy();
  }
}

async function exportToGoogleSlides(slideData) {
  try {
    // 1. Get OAuth token
    const token = await chrome.identity.getAuthToken({ interactive: true });
    if (!token) throw new Error('Authentication failed');

    // 2. Create new presentation
    const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'AI-Generated Presentation' })
    });

    const presentation = await createResponse.json();
    const presentationId = presentation.presentationId;

    // 3. Build requests to create slides with cards
    const requests = [];

    slideData.forEach((slide, index) => {
      if (index === 0) return; // Skip title slide (already created)

      // Create new slide
      requests.push({
        createSlide: {
          objectId: `slide_${index}`,
          insertionIndex: index
        }
      });

      // Add title box (card header)
      const titleBoxId = `title_box_${index}`;
      requests.push({
        createShape: {
          objectId: titleBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: `slide_${index}`,
            size: { width: { magnitude: 500, unit: 'PT' }, height: { magnitude: 40, unit: 'PT' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 80,
              unit: 'PT'
            }
          }
        }
      });

      // Insert title text
      requests.push({
        insertText: {
          objectId: titleBoxId,
          text: slide.title
        }
      });

      // Style title as card header
      requests.push({
        updateTextStyle: {
          objectId: titleBoxId,
          style: {
            fontSize: { magnitude: 18, unit: 'PT' },
            bold: true,
            foregroundColor: { opaqueColor: { rgbColor: { blue: 0.8, green: 0.2, red: 0.1 } } }
          },
          fields: 'fontSize,bold,foregroundColor'
        }
      });

      // Add content box (card body)
      const contentBoxId = `content_box_${index}`;
      requests.push({
        createShape: {
          objectId: contentBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: `slide_${index}`,
            size: { width: { magnitude: 500, unit: 'PT' }, height: { magnitude: 200, unit: 'PT' } },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 130,
              unit: 'PT'
            }
          }
        }
      });

      // Insert content
      requests.push({
        insertText: {
          objectId: contentBoxId,
          text: slide.content
        }
      });

      // Style content
      requests.push({
        updateTextStyle: {
          objectId: contentBoxId,
          style: { fontSize: { magnitude: 14, unit: 'PT' } },
          fields: 'fontSize'
        }
      });
    });

    // 4. Execute batch update
    await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    // 5. Open the presentation
    const url = `https://docs.google.com/presentation/d/${presentationId}/edit`;
    await chrome.tabs.create({ url });
    alert('✅ Presentation exported to Google Slides!');
  } catch (error) {
    console.error('Export failed:', error);
    alert('❌ Failed to export: ' + (error.message || 'Check console for details'));
  }
}
async function handleSummarize() {
  const input = document.getElementById('summarizeInput').value.trim();
  const output = document.getElementById('summarizeOutput');
  const btn = document.getElementById('summarizeBtn');

  if (!input) {
    showError('Please enter text to summarize');
    return;
  }

  btn.disabled = true;
  output.innerHTML = '<span class="loading"></span> Summarizing...';

  try {
    const stream = await summarizerHandler.summarizeStreaming(input);

    let fullSummary = '';
    for await (const chunk of stream) {
      fullSummary += chunk;
      const formatted = formatSummaryOutput(fullSummary, summarizerHandler.currentOptions.type);
      output.innerHTML = '';
      output.appendChild(formatted);
    }

  } catch (error) {
    output.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    showError(`Summarization failed: ${error.message}`);
  } finally {
    btn.disabled = false;
  }
}

function handleWriterConfigChange() {
  const tone = document.getElementById('writerTone').value;
  const length = document.getElementById('writerLength').value;
  const format = document.getElementById('writerFormat').value;

  const needsRecreate = writerHandler.updateOptions({ tone, length, format });

  if (needsRecreate && writerHandler.writer) {
    writerHandler.destroy();
  }
}

async function handleWrite() {
  const prompt = document.getElementById('writePrompt').value.trim();
  const context = document.getElementById('writeContext').value.trim();
  const output = document.getElementById('writeOutput');
  const btn = document.getElementById('writeBtn');

  if (!prompt) {
    showError('Please enter a writing prompt');
    return;
  }

  btn.disabled = true;
  output.innerHTML = '<span class="loading"></span> Writing...';

  try {
    const stream = await writerHandler.writeStreaming(prompt, context);

    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk;
      const formatted = formatWriterOutput(fullText);
      output.innerHTML = '';
      output.appendChild(formatted);
    }

  } catch (error) {
    output.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    showError(`Writing failed: ${error.message}`);
  } finally {
    btn.disabled = false;
  }
}

function handleRewriterConfigChange() {
  const tone = document.getElementById('rewriterTone').value;
  const length = document.getElementById('rewriterLength').value;
  const format = document.getElementById('rewriterFormat').value;

  const needsRecreate = rewriterHandler.updateOptions({ tone, length, format });

  if (needsRecreate && rewriterHandler.rewriter) {
    rewriterHandler.destroy();
  }
}

async function handleRewrite() {
  const input = document.getElementById('rewriteInput').value.trim();
  const context = document.getElementById('rewriteContext').value.trim();
  const output = document.getElementById('rewriteOutput');
  const btn = document.getElementById('rewriteBtn');

  if (!input) {
    showError('Please enter text to rewrite');
    return;
  }

  btn.disabled = true;
  output.innerHTML = '<span class="loading"></span> Rewriting...';

  try {
    const stream = await rewriterHandler.rewriteStreaming(input, context);

    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk;
      const formatted = formatRewriterOutput(fullText);
      output.innerHTML = '';
      output.appendChild(formatted);
    }

  } catch (error) {
    output.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    showError(`Rewriting failed: ${error.message}`);
  } finally {
    btn.disabled = false;
  }
}

function showError(message) {
  console.error(message);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initializeApp);