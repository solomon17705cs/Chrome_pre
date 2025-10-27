// Configuration for popup timeouts
const POPUP_CONFIG = {
  notificationTimeout: 5000,        // 5 seconds for personal data notifications
  notificationHoverPause: true,     // Pause timeout when hovering
  modalInactivityTimeout: 30000,    // 30 seconds for modal auto-close (set to 0 to disable)
};

const promptHandler = new PromptAPIHandler();
const summarizerHandler = new SummarizerAPIHandler();
const writerHandler = new WriterAPIHandler();
const rewriterHandler = new RewriterAPIHandler();

// Initialize Personal Data Manager
let personalDataManager = null;
let dataManagementModal = null;
try {
  personalDataManager = new PersonalDataManager();
  
  // Initialize Data Management Modal if PersonalDataManager is available
  if (typeof DataManagementModal !== 'undefined') {
    dataManagementModal = new DataManagementModal(personalDataManager);
  }
} catch (error) {
  console.warn('Personal Data Manager not available:', error);
}

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
    showError(
      'AI APIs are not available in this browser. Please ensure you meet the requirements.',
      'warning',
      8000
    );
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

  document.querySelectorAll('.mode-btn, .dropdown-item').forEach(btn => {
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

  const personalDataBtn = document.getElementById('personalDataBtn');
  if (personalDataBtn && dataManagementModal) {
    personalDataBtn.addEventListener('click', () => {
      dataManagementModal.open();
    });
  }

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

  document.querySelectorAll('.mode-btn, .dropdown-item').forEach(btn => {
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

// Removed duplicate handleFileSelect function - using the enhanced version below

function setupDragAndDrop() {
  const fileUploadArea = document.getElementById('fileUploadArea');

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileUploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    fileUploadArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fileUploadArea.addEventListener(eventName, unhighlight, false);
  });

  // Handle dropped files
  fileUploadArea.addEventListener('drop', handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    fileUploadArea.classList.add('drag-over');
  }

  function unhighlight(e) {
    fileUploadArea.classList.remove('drag-over');
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    // Create a fake event object to reuse handleFileSelect
    const fakeEvent = {
      target: {
        files: files
      }
    };

    handleFileSelect(fakeEvent);
  }
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
  sendBtn.classList.add('loading');
  sendBtn.innerHTML = '<span>Sending...</span>';

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

  let extractedData = null;
  let enhancedMessage = message;

  try {
    // Extract and store personal data if Personal Data Manager is available
    if (personalDataManager) {
      try {
        extractedData = personalDataManager.extractAndStore(message);
        
        // Show notification if new data was extracted
        if (extractedData && extractedData.hasData) {
          showPersonalDataNotification(extractedData);
        }
        
        // Generate context and enhance message
        const context = personalDataManager.generateContext(message);
        if (context) {
          enhancedMessage = personalDataManager.injectContext(message, context);
        }
      } catch (dataError) {
        console.warn('Personal data processing failed:', dataError);
        // Continue with original message if data processing fails
      }
    }

    const stream = await promptHandler.promptStreaming(enhancedMessage);
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
        const errorMsg = createErrorMessage(
          'Failed to generate mind map. Please try a more specific topic.',
          'warning',
          [{
            text: 'Try Again',
            handler: () => {
              const input = document.getElementById('chatInput');
              input.focus();
            }
          }]
        );
        contentDiv.innerHTML = '';
        contentDiv.appendChild(errorMsg);
      }
    } else {
      // For all other modes: use incremental-compatible string output
      const formatted = formatPromptOutput(fullResponse, promptHandler.currentMode);
      contentDiv.innerHTML = '';
      contentDiv.appendChild(formatted);
    }

    // Store conversation in chat history if Personal Data Manager is available
    if (personalDataManager) {
      try {
        personalDataManager.storeChatHistory(message, fullResponse, extractedData);
      } catch (historyError) {
        console.warn('Failed to store chat history:', historyError);
      }
    }

    // Cleanup
    promptHandler.clearFiles();
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('fileUploadArea').style.display = 'none';
    document.getElementById('attachBtn').classList.remove('active');

  } catch (error) {
    const errorMsg = createErrorMessage(
      `Failed to get response: ${error.message}`,
      'critical',
      [{
        text: 'Retry',
        handler: () => handleChatSend()
      }]
    );
    assistantMessage.querySelector('.message-content').innerHTML = '';
    assistantMessage.querySelector('.message-content').appendChild(errorMsg);
    showError(`Failed to get response: ${error.message}`, 'critical');
  } finally {
    sendBtn.disabled = false;
    sendBtn.classList.remove('loading');
    sendBtn.innerHTML = 'Send';
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
    const errorMsg = createErrorMessage(
      `Summarization failed: ${error.message}`,
      'critical',
      [{
        text: 'Try Again',
        handler: () => handleSummarize()
      }]
    );
    output.innerHTML = '';
    output.appendChild(errorMsg);
    showError(`Summarization failed: ${error.message}`, 'critical');
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
    const errorMsg = createErrorMessage(
      `Writing failed: ${error.message}`,
      'critical',
      [{
        text: 'Try Again',
        handler: () => handleWrite()
      }]
    );
    output.innerHTML = '';
    output.appendChild(errorMsg);
    showError(`Writing failed: ${error.message}`, 'critical');
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
  const inputElement = document.getElementById('rewriteInput');
  const input = inputElement ? inputElement.value.trim() : '';
  const contextElement = document.getElementById('rewriteContext');
  const context = contextElement ? contextElement.value.trim() : '';
  const output = document.getElementById('rewriteOutput');
  const btn = document.getElementById('rewriteBtn');

  console.log('Rewrite input value:', input); // Debug log
  console.log('Input element found:', !!inputElement); // Debug log

  if (!input) {
    showError('Please enter text to rewrite');
    inputElement?.focus(); // Focus the input field
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
    const errorMsg = createErrorMessage(
      `Rewriting failed: ${error.message}`,
      'critical',
      [{
        text: 'Try Again',
        handler: () => handleRewrite()
      }]
    );
    output.innerHTML = '';
    output.appendChild(errorMsg);
    showError(`Rewriting failed: ${error.message}`, 'critical');
  } finally {
    btn.disabled = false;
  }
}

function showError(message, type = 'error', duration = 5000) {
  console.error(message);

  // Create error toast notification
  const toast = document.createElement('div');
  toast.className = `error-message error-toast error-${type} error-dismissible`;

  const content = document.createElement('div');
  content.className = 'error-message-content';
  content.textContent = message;

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'error-dismiss-btn';
  dismissBtn.innerHTML = '×';
  dismissBtn.title = 'Dismiss';

  toast.appendChild(content);
  toast.appendChild(dismissBtn);

  // Add to document
  document.body.appendChild(toast);

  // Auto dismiss
  const timeoutId = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  // Manual dismiss
  dismissBtn.addEventListener('click', () => {
    clearTimeout(timeoutId);
    dismissToast(toast);
  });

  function dismissToast(toastElement) {
    toastElement.classList.add('error-toast-exit');
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 300);
  }
}

function createErrorMessage(message, type = 'error', actions = []) {
  const errorDiv = document.createElement('div');
  errorDiv.className = `error-message error-${type}`;

  const content = document.createElement('div');
  content.className = 'error-message-content';
  content.textContent = message;
  errorDiv.appendChild(content);

  if (actions.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'error-message-actions';

    actions.forEach(action => {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'error-action-btn';
      actionBtn.textContent = action.text;
      actionBtn.addEventListener('click', action.handler);
      actionsDiv.appendChild(actionBtn);
    });

    errorDiv.appendChild(actionsDiv);
  }

  return errorDiv;
}

function showComponentError(container, title, message, actions = []) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'component-error';

  const icon = document.createElement('div');
  icon.className = 'component-error-icon';
  icon.textContent = '⚠️';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'component-error-title';
  titleDiv.textContent = title;

  const messageDiv = document.createElement('div');
  messageDiv.className = 'component-error-message';
  messageDiv.textContent = message;

  errorDiv.appendChild(icon);
  errorDiv.appendChild(titleDiv);
  errorDiv.appendChild(messageDiv);

  if (actions.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'component-error-actions';

    actions.forEach(action => {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'error-action-btn';
      actionBtn.textContent = action.text;
      actionBtn.addEventListener('click', action.handler);
      actionsDiv.appendChild(actionBtn);
    });

    errorDiv.appendChild(actionsDiv);
  }

  container.innerHTML = '';
  container.appendChild(errorDiv);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show notification when new personal data is detected
 * @param {Object} extractedData - Data that was extracted from the message
 */
function showPersonalDataNotification(extractedData) {
  // Create notification container if it doesn't exist
  let notificationContainer = document.getElementById('personalDataNotifications');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'personalDataNotifications';
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'personal-data-notification slide-in';
  
  // Generate notification content based on extracted data
  const content = generateNotificationContent(extractedData);
  
  notification.innerHTML = `
    <div class="notification-header">
      <span class="notification-icon">🧠</span>
      <span class="notification-title">New Information Learned</span>
      <button class="notification-dismiss" aria-label="Dismiss notification">×</button>
    </div>
    <div class="notification-content">
      ${content}
    </div>
    <div class="notification-actions">
      <button class="notification-action-btn view-data-btn">View All Data</button>
    </div>
  `;

  // Add event listeners
  const dismissBtn = notification.querySelector('.notification-dismiss');
  const viewDataBtn = notification.querySelector('.view-data-btn');
  
  dismissBtn.addEventListener('click', () => {
    dismissNotification(notification);
  });
  
  viewDataBtn.addEventListener('click', () => {
    if (dataManagementModal) {
      dataManagementModal.open();
    } else {
      console.log('Data management modal not available');
    }
    dismissNotification(notification);
  });

  // Add to container
  notificationContainer.appendChild(notification);

  // Auto-dismiss after configurable timeout
  const timeoutDuration = POPUP_CONFIG.notificationTimeout;
  const timeoutId = setTimeout(() => {
    if (notification.parentNode) {
      dismissNotification(notification);
    }
  }, timeoutDuration);
  
  // Store timeout ID on notification for potential cancellation
  notification.timeoutId = timeoutId;
  
  // Optional: Cancel auto-dismiss if user hovers over notification
  if (POPUP_CONFIG.notificationHoverPause) {
    notification.addEventListener('mouseenter', () => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
        notification.timeoutId = null;
      }
    });
    
    // Restart auto-dismiss when user stops hovering
    notification.addEventListener('mouseleave', () => {
      if (!notification.timeoutId) {
        notification.timeoutId = setTimeout(() => {
          if (notification.parentNode) {
            dismissNotification(notification);
          }
        }, timeoutDuration);
      }
    });
  }
}

/**
 * Generate notification content based on extracted data
 * @param {Object} extractedData - Extracted personal data
 * @returns {string} HTML content for notification
 */
function generateNotificationContent(extractedData) {
  const items = [];
  
  // Personal information
  if (extractedData.personal && Object.keys(extractedData.personal).length > 0) {
    const personalItems = [];
    if (extractedData.personal.name) personalItems.push(`name: ${extractedData.personal.name}`);
    if (extractedData.personal.age) personalItems.push(`age: ${extractedData.personal.age}`);
    if (extractedData.personal.location) personalItems.push(`location: ${extractedData.personal.location}`);
    if (extractedData.personal.occupation) personalItems.push(`occupation: ${extractedData.personal.occupation}`);
    if (extractedData.personal.email) personalItems.push(`email: ${extractedData.personal.email}`);
    if (extractedData.personal.phone) personalItems.push(`phone: ${extractedData.personal.phone}`);
    
    if (personalItems.length > 0) {
      items.push(`<strong>Personal:</strong> ${personalItems.join(', ')}`);
    }
  }
  
  // Preferences
  if (extractedData.preferences) {
    const prefItems = [];
    if (extractedData.preferences.likes && extractedData.preferences.likes.length > 0) {
      prefItems.push(`likes ${extractedData.preferences.likes.join(', ')}`);
    }
    if (extractedData.preferences.dislikes && extractedData.preferences.dislikes.length > 0) {
      prefItems.push(`dislikes ${extractedData.preferences.dislikes.join(', ')}`);
    }
    if (extractedData.preferences.favorites && extractedData.preferences.favorites.length > 0) {
      prefItems.push(`favorites: ${extractedData.preferences.favorites.join(', ')}`);
    }
    
    if (prefItems.length > 0) {
      items.push(`<strong>Preferences:</strong> ${prefItems.join('; ')}`);
    }
  }
  
  // Events
  if (extractedData.events && extractedData.events.length > 0) {
    const eventItems = extractedData.events.map(event => `${event.type}: ${event.details}`);
    items.push(`<strong>Events:</strong> ${eventItems.join(', ')}`);
  }
  
  // Work information
  if (extractedData.work && Object.keys(extractedData.work).length > 0) {
    const workItems = [];
    if (extractedData.work.company) workItems.push(`company: ${extractedData.work.company}`);
    if (extractedData.work.position) workItems.push(`position: ${extractedData.work.position}`);
    if (extractedData.work.colleagues && extractedData.work.colleagues.length > 0) {
      workItems.push(`colleagues: ${extractedData.work.colleagues.join(', ')}`);
    }
    if (extractedData.work.projects && extractedData.work.projects.length > 0) {
      workItems.push(`projects: ${extractedData.work.projects.join(', ')}`);
    }
    
    if (workItems.length > 0) {
      items.push(`<strong>Work:</strong> ${workItems.join(', ')}`);
    }
  }
  
  // Goals
  if (extractedData.goals && extractedData.goals.length > 0) {
    const goalItems = extractedData.goals.map(goal => goal.goal);
    items.push(`<strong>Goals:</strong> ${goalItems.join(', ')}`);
  }
  
  return items.length > 0 ? items.join('<br>') : 'New information detected and stored.';
}

/**
 * Dismiss notification with animation
 * @param {HTMLElement} notification - Notification element to dismiss
 */
function dismissNotification(notification) {
  notification.classList.add('slide-out');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

document.addEventListener('DOMContentLoaded', initializeApp);