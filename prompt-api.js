class PromptAPIHandler {
  constructor() {
    this.session = null;
    this.currentMode = 'chat';
    this.uploadedFiles = [];
  }

  
async checkAvailability() {
  if (typeof LanguageModel === 'undefined') {
    return 'unavailable';
  }
  try {
    return await LanguageModel.availability();
  } catch (error) {
    console.error('Prompt API unavailable:', error);
    return 'unavailable';
  }
}

  async createSession() {
    try {
      const params = await LanguageModel.params();

      const options = {
        temperature: params.defaultTemperature,
        topK: params.defaultTopK,
        monitor(m) {
  m.addEventListener('downloadprogress', (e) => {
    console.log(`Prompt model download: ${Math.round(e.loaded * 100)}%`);
    // Optional: show per-message loading spinner, but NOT global status
  });
},
      };

      // Add system prompt via initialPrompts for consistency (works with multimodal)
      const systemPrompt = this.getSystemPrompt();
      if (systemPrompt) {
        options.initialPrompts = [{ role: 'system', content: systemPrompt }];
      }

      if (this.uploadedFiles.length > 0) {
        options.expectedInputs = [
          { type: "text", languages: ["en"] }
        ];

        const hasImages = this.uploadedFiles.some(f => f.type.startsWith('image/'));
        const hasAudio = this.uploadedFiles.some(f => f.type.startsWith('audio/'));

        if (hasImages) {
          options.expectedInputs.push({ type: "image" });
        }
        if (hasAudio) {
          options.expectedInputs.push({ type: "audio" });
        }
      }

      // Optional: Add AbortController support for canceling session creation
      // Example usage: const controller = new AbortController(); options.signal = controller.signal;
      // Then controller.abort() to cancel.

      this.session = await LanguageModel.create(options);
      return true;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  async prompt(userMessage) {
    if (!this.session) {
      await this.createSession();
    }

    let promptContent = userMessage;

    if (this.uploadedFiles.length > 0) {
      const content = [
        { type: 'text', value: userMessage }
      ];

      for (const file of this.uploadedFiles) {
        if (file.type.startsWith('image/')) {
          content.push({ type: 'image', value: file.file });
        } else if (file.type.startsWith('audio/')) {
          content.push({ type: 'audio', value: file.file });
        }
      }

      promptContent = [{ role: 'user', content }];
    }

    // System prompt is now in initialPrompts, so no need to prepend here

    return await this.session.prompt(promptContent);
  }
  

  async promptStreaming(userMessage) {
    if (!this.session || this.uploadedFiles.length > 0) {
    await this.createSession();
  }

    let promptContent = userMessage;

    if (this.uploadedFiles.length > 0) {
      const content = [
        { type: 'text', value: userMessage }
      ];

      for (const file of this.uploadedFiles) {
        if (file.type.startsWith('image/')) {
          content.push({ type: 'image', value: file.file });
        } else if (file.type.startsWith('audio/')) {
          content.push({ type: 'audio', value: file.file });
        }
      }

      promptContent = [{ role: 'user', content }];
    }

    // System prompt is now in initialPrompts, so no need to prepend here

    return this.session.promptStreaming(promptContent);
  }

  getSystemPrompt() {
    switch (this.currentMode) {
      case 'mindmap':
  return `You are a JSON-only mind map generator. Your task is to generate a hierarchical mind map as a JSON object with this structure:
{
  "root": "Central Topic",
  "branches": [
    {
      "title": "Main Branch",
      "children": ["Detail 1", "Detail 2"]
    }
  ]
}
Rules:
- If the user's topic is too vague (e.g., "computer", "science", "AI"), respond with telling the very very core components or the necessary things for that specific topic}
- NEVER add explanations, apologies, or markdown.
- NEVER wrap JSON in code blocks (like \`\`\`json).
- Return ONLY valid JSON. No extra text before or after.
Now generate a mind map for:`;

      case 'roadmap':
        return `Create a detailed roadmap with clear steps and timelines. Format as:
# Project/Core name Roadmap

## Phase 1: [Name] (Timeline)
- Objective: [Goal]
- Tasks:
  - Task 1
  - Task 2
- Deliverables: [What will be completed]

## Phase 2: [Name] (Timeline)
[Continue pattern...]

Include milestones and dependencies.`;

      case 'flashcard':
        return `Create flashcards for learning. Format each card as:

CARD 1
Q: [Question or concept]
A: [Answer or explanation]

CARD 2
Q: [Question or concept]
A: [Answer or explanation]

Create 5-10 cards that cover the key concepts.`;

      case 'powerpoint':
        return `Create a PowerPoint presentation outline. Format as:

SLIDE 1: Title Slide
- Title: [Main Title]
- Subtitle: [Subtitle]

SLIDE 2: [Slide Title]
- Key point 1
- Key point 2
- Key point 3

SLIDE 3: [Slide Title]
[Continue pattern...]

Create 5-8 slides with clear, concise content.`;

      default:
        return '';
    }
  }

  setMode(mode) {
    console.log('Setting mode from', this.currentMode, 'to', mode);
    this.currentMode = mode;
    
    // Destroy existing session to force recreation with new system prompt
    if (this.session) {
      console.log('Destroying existing session for mode change');
      this.session.destroy();
      this.session = null;
    }
  }

  addFile(file) {
    this.uploadedFiles.push({
      file: file,
      name: file.name,
      type: file.type
    });
  }

  clearFiles() {
    this.uploadedFiles = [];
  }

  removeFile(index) {
    this.uploadedFiles.splice(index, 1);
  }

  async destroy() {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }
}

/**
 * Parses AI-generated slide content to identify individual slides using "SLIDE X:" markers
 * @param {string} text - The AI-generated text content
 * @returns {Object} Object containing slides array, validation status, and original content
 */
function parseSlides(text) {
  const result = {
    slides: [],
    isValid: false,
    rawContent: text || '',
    errors: []
  };

  // Input validation
  if (!text || typeof text !== 'string') {
    result.errors.push('Invalid input: text must be a non-empty string');
    return result;
  }

  if (text.trim().length === 0) {
    result.errors.push('Empty content provided');
    return result;
  }

  // Regex to match slide markers like "SLIDE 1:", "SLIDE 2:", etc.
  const slideMarkerRegex = /^SLIDE\s+(\d+):\s*(.*)$/gim;
  const slides = [];
  let match;

  // Find all slide markers and their positions
  const markers = [];
  while ((match = slideMarkerRegex.exec(text)) !== null) {
    const slideNumber = parseInt(match[1]);
    
    // Validate slide number
    if (isNaN(slideNumber) || slideNumber <= 0) {
      result.errors.push(`Invalid slide number: ${match[1]}`);
      continue;
    }

    markers.push({
      slideNumber: slideNumber,
      title: match[2].trim(),
      startIndex: match.index,
      endIndex: slideMarkerRegex.lastIndex
    });
  }

  // If no slide markers found, return with error
  if (markers.length === 0) {
    result.errors.push('No valid slide markers found (expected format: "SLIDE X: Title")');
    return result;
  }

  // Check for duplicate slide numbers
  const slideNumbers = markers.map(m => m.slideNumber);
  const duplicates = slideNumbers.filter((num, index) => slideNumbers.indexOf(num) !== index);
  if (duplicates.length > 0) {
    result.errors.push(`Duplicate slide numbers found: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Extract content for each slide
  for (let i = 0; i < markers.length; i++) {
    const currentMarker = markers[i];
    const nextMarker = markers[i + 1];
    
    // Content starts after the current slide marker line
    const contentStart = currentMarker.endIndex;
    // Content ends at the start of the next slide marker, or end of text
    const contentEnd = nextMarker ? nextMarker.startIndex : text.length;
    
    // Extract and clean the content
    let content = text.substring(contentStart, contentEnd).trim();
    
    // Remove any leading/trailing whitespace and normalize line breaks
    content = content.replace(/^\n+|\n+$/g, '').trim();
    
    // Validate slide content
    if (!content || content.length === 0) {
      result.errors.push(`Slide ${currentMarker.slideNumber} has empty content`);
      content = 'No content available for this slide.';
    }

    // Validate slide title
    let title = currentMarker.title;
    if (!title || title.length === 0) {
      title = `Slide ${currentMarker.slideNumber}`;
      result.errors.push(`Slide ${currentMarker.slideNumber} has no title, using default`);
    }

    // Create slide object
    const slide = {
      title: title,
      content: content,
      slideNumber: currentMarker.slideNumber,
      isValid: content.length > 0 && title.length > 0
    };
    
    slides.push(slide);
  }

  // Sort slides by slide number to ensure correct order
  slides.sort((a, b) => a.slideNumber - b.slideNumber);
  
  // Check for missing slide numbers (gaps in sequence)
  if (slides.length > 1) {
    for (let i = 1; i < slides.length; i++) {
      const expectedNumber = slides[i - 1].slideNumber + 1;
      if (slides[i].slideNumber !== expectedNumber) {
        result.errors.push(`Missing slide number ${expectedNumber} in sequence`);
      }
    }
  }

  result.slides = slides;
  result.isValid = slides.length > 0 && slides.every(slide => slide.isValid);
  
  return result;
}

/**
 * Validates parsed slide structure and provides fallback handling
 * @param {Object} parseResult - Result from parseSlides function
 * @returns {Object} Validated result with fallback options
 */
function validateSlideContent(parseResult) {
  if (!parseResult || typeof parseResult !== 'object') {
    return {
      isValid: false,
      slides: [],
      shouldFallback: true,
      fallbackContent: '',
      errors: ['Invalid parse result']
    };
  }

  const { slides, isValid, rawContent, errors } = parseResult;
  
  // If parsing completely failed, recommend fallback to markdown
  if (!slides || slides.length === 0) {
    return {
      isValid: false,
      slides: [],
      shouldFallback: true,
      fallbackContent: rawContent,
      errors: errors || ['No slides could be parsed']
    };
  }

  // If some slides are invalid but we have valid ones, proceed with valid slides
  const validSlides = slides.filter(slide => slide.isValid);
  const hasValidSlides = validSlides.length > 0;

  return {
    isValid: hasValidSlides,
    slides: hasValidSlides ? validSlides : slides,
    shouldFallback: !hasValidSlides,
    fallbackContent: rawContent,
    errors: errors || [],
    warnings: hasValidSlides && validSlides.length < slides.length ? 
      [`${slides.length - validSlides.length} slides had issues and were filtered out`] : []
  };
}

/**
 * Renders a single slide container with proper styling and content
 * @param {Object} slide - Slide object with title, content, and slideNumber
 * @param {number} index - Index of the slide in the array
 * @returns {HTMLElement} DOM element for the slide container
 */
function renderSlideContainer(slide, index) {
  // Create the main slide container
  const slideContainer = document.createElement('div');
  slideContainer.className = 'slide-container';
  
  // Create slide title element
  const slideTitle = document.createElement('div');
  slideTitle.className = 'slide-title';
  slideTitle.textContent = slide.title;
  
  // Create slide content element
  const slideContent = document.createElement('div');
  slideContent.className = 'slide-content';
  slideContent.innerHTML = formatMarkdown(slide.content);
  
  // Append title and content to container
  slideContainer.appendChild(slideTitle);
  slideContainer.appendChild(slideContent);
  
  return slideContainer;
}

function formatPromptOutput(text, mode) {
  const container = document.createElement('div');
  container.className = 'output-container';
  
  // Only show export button for powerpoint mode
  const exportBtn = document.getElementById('exportToSlidesBtn');
  if (exportBtn) {
    exportBtn.style.display = mode === 'powerpoint' ? 'block' : 'none';
  }
  
  // Store slide data for export functionality
  let slideDataForExport = null;

  switch (mode) {
    case 'mindmap':
      // ✅ Use the existing `container` — DO NOT re-declare it
      if (text.trim() === 'Mind Map' || text.toLowerCase().includes('cannot') || !text.includes('{')) {
        container.innerHTML = `
          <div class="mindmap-error">
            <p>⚠️ The AI couldn't generate a mind map for this topic.</p>
            <p>Please try a more specific or broader topic, like "Computer Systems" or "Photosynthesis".</p>
          </div>
        `;
        return container;
      }

      try {
        const mindMapData = JSON.parse(text.trim());
        container.appendChild(renderMindMapFromJSON(mindMapData));
      } catch (e) {
        console.warn('Failed to parse mind map JSON, falling back to plain text', e);
        container.innerHTML = formatMarkdown(text);
      }
      break;

    case 'roadmap':
      const steps = text.split(/##\s+/).filter(s => s.trim());
      steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'roadmap-step';
        stepDiv.innerHTML = formatMarkdown('## ' + step);
        container.appendChild(stepDiv);
      });
      break;

    case 'flashcard':
      const cards = text.split(/CARD\s+\d+/).filter(c => c.trim());
      cards.forEach(card => {
        const [question, answer] = card.split(/A:/);
        if (question && answer) {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'flashcard';
          cardDiv.innerHTML = `
            <div class="flashcard-front">${question.replace(/Q:/, '').trim()}</div>
            <div class="flashcard-back">${answer.trim()}</div>
          `;
          cardDiv.onclick = () => cardDiv.classList.toggle('flipped');
          container.appendChild(cardDiv);
        }
      });
      break;

    case 'powerpoint':
      const parseResult = parseSlides(text);
      const validationResult = validateSlideContent(parseResult);
      
      if (validationResult.shouldFallback) {
        // Fall back to markdown rendering if parsing failed
        container.innerHTML = formatMarkdown(text);
        // For fallback, try to extract basic slide data from raw text
        slideDataForExport = extractSlideDataFromText(text);
      } else {
        // Render slides in containers
        validationResult.slides.forEach((slide, index) => {
          const slideContainer = renderSlideContainer(slide, index);
          container.appendChild(slideContainer);
        });
        // Store parsed slide data for export
        slideDataForExport = validationResult.slides.map(slide => ({
          title: slide.title,
          content: slide.content
        }));
      }
      break;

    default:
      container.innerHTML = formatMarkdown(text);
  }

  // Set up export button functionality for powerpoint mode
  if (mode === 'powerpoint' && slideDataForExport) {
    setupExportButtonHandler(slideDataForExport);
  }

  return container;
}

/**
 * Sets up the export button click handler with the current slide data
 * @param {Array} slideData - Array of slide objects with title and content
 */
function setupExportButtonHandler(slideData) {
  const exportBtn = document.getElementById('exportToSlidesBtn');
  if (!exportBtn) return;
  
  // Remove any existing event listeners
  const newExportBtn = exportBtn.cloneNode(true);
  exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);
  
  // Add new event listener with current slide data
  newExportBtn.addEventListener('click', () => {
    exportToGoogleSlides(slideData);
  });
}

/**
 * Extracts slide data from raw text for fallback scenarios
 * @param {string} text - Raw text content
 * @returns {Array} Array of slide objects
 */
function extractSlideDataFromText(text) {
  const slides = [];
  
  // Try to parse basic slide structure from text
  const lines = text.split('\n');
  let currentSlide = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for slide markers
    const slideMatch = trimmedLine.match(/^SLIDE\s+(\d+):\s*(.*)$/i);
    if (slideMatch) {
      // Save previous slide if exists
      if (currentSlide) {
        slides.push(currentSlide);
      }
      
      // Start new slide
      currentSlide = {
        title: slideMatch[2] || `Slide ${slideMatch[1]}`,
        content: ''
      };
    } else if (currentSlide && trimmedLine) {
      // Add content to current slide
      if (currentSlide.content) {
        currentSlide.content += '\n';
      }
      currentSlide.content += trimmedLine;
    }
  }
  
  // Add the last slide
  if (currentSlide) {
    slides.push(currentSlide);
  }
  
  // If no slides found, create a single slide with all content
  if (slides.length === 0) {
    slides.push({
      title: 'Presentation',
      content: text
    });
  }
  
  return slides;
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

function formatMarkdown(text) {
  // Escape HTML first to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>');

  // Convert **bold** and *italic*
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>');

  // Handle headings
  html = html
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Handle unordered lists (support *, -, +)
  // This handles multi-line lists correctly
  html = html.replace(/^(\s*[-*+]\s+.*)$(\n(?!\s*[-*+]).*)*/gm, (match) => {
    const items = match.split('\n').filter(line => line.trim());
    const listItems = items.map(item => {
      const content = item.replace(/^(\s*[-*+]\s+)/, '');
      return `<li>${content}</li>`;
    }).join('');
    return `<ul>${listItems}</ul>`;
  });

  // Wrap paragraphs (lines not part of lists/headings)
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block || block.startsWith('<') || block.includes('<li>')) {
        return block;
      }
      return `<p>${block}</p>`;
    })
    .join('\n');

  // Clean up extra newlines
  html = html.replace(/\n/g, '');

  return html;
}
/**
 * Parses markdown-style mind map into structured data:
 * {
 *   title: "Central Topic",
 *   children: [
 *     { title: "Main Branch 1", children: [...] },
 *     ...
 *   ]
 * }
 */
function parseMindMapMarkdown(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let root = null;
  const stack = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Central topic
      root = { title: line.slice(2), children: [] };
      stack.push({ node: root, depth: 0 });
    } else if (line.startsWith('## ')) {
      // Main branch (level 1)
      const node = { title: line.slice(3), children: [] };
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      stack.push({ node, depth: 1 });
    } else if (line.startsWith('### ')) {
      // Sub-branch (level 2)
      const node = { title: line.slice(4), children: [] };
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      stack.push({ node, depth: 2 });
    } else if (line.startsWith('- ')) {
      // Leaf detail (level 3)
      const detail = line.slice(2);
      const parent = stack[stack.length - 1].node;
      parent.children.push({ title: detail, children: [], isLeaf: true });
    } else if (stack.length > 0) {
      // Continue current leaf or node
      const last = stack[stack.length - 1].node;
      if (last.isLeaf) {
        last.title += ' ' + line;
      } else {
        last.title += ' ' + line;
      }
    }
  }

  return root || { title: 'Mind Map', children: [] };
}

/**
 * Renders a mind map node as a collapsible DOM element
 */
function renderMindMapNode(node, isRoot = false) {
  const wrapper = document.createElement('div');
  wrapper.className = `mindmap-node ${isRoot ? 'mindmap-root' : ''}`;

  const header = document.createElement('div');
  header.className = 'mindmap-header';
  if (!isRoot) {
    const toggle = document.createElement('span');
    toggle.className = 'mindmap-toggle';
    toggle.textContent = node.children && node.children.length > 0 ? '▶' : '•';
    header.appendChild(toggle);
  }

  const title = document.createElement('span');
  title.className = 'mindmap-title';
  title.textContent = node.title;
  header.appendChild(title);

  wrapper.appendChild(header);

  if (node.children && node.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'mindmap-children';
    childrenContainer.style.display = isRoot ? 'block' : 'none'; // root always visible

    node.children.forEach(child => {
      const childEl = renderMindMapNode(child);
      childrenContainer.appendChild(childEl);
    });

    wrapper.appendChild(childrenContainer);

    if (!isRoot) {
      header.addEventListener('click', () => {
        const isVisible = childrenContainer.style.display === 'block';
        childrenContainer.style.display = isVisible ? 'none' : 'block';
        toggle.textContent = isVisible ? '▶' : '▼';
      });
    }
  }

  return wrapper;
}
/**
 * Parses markdown-style mind map into structured tree
 */
function parseMindMapMarkdown(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let root = null;
  const stack = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Central topic
      root = { title: line.slice(2), children: [] };
      stack.push({ node: root, depth: 0 });
    } else if (line.startsWith('## ')) {
      // Main branch (level 1)
      const node = { title: line.slice(3), children: [], expanded: false };
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      stack.push({ node, depth: 1 });
    } else if (line.startsWith('### ')) {
      // Sub-branch (level 2)
      const node = { title: line.slice(4), children: [], expanded: false };
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      stack.push({ node, depth: 2 });
    } else if (line.startsWith('- ')) {
      // Leaf detail (level 3)
      const detail = line.slice(2);
      const parent = stack[stack.length - 1].node;
      parent.children.push({ title: detail, children: [], isLeaf: true, expanded: false });
    } else if (stack.length > 0) {
      // Continue current leaf or node
      const last = stack[stack.length - 1].node;
      if (last.isLeaf) {
        last.title += ' ' + line;
      } else {
        last.title += ' ' + line;
      }
    }
  }

  return root || { title: 'Mind Map', children: [] };
}

/**
 * Renders a vertical mind map tree with SVG connections
 */
function renderMindMapTree(rootNode) {
  const container = document.createElement('div');
  container.className = 'mindmap-tree';

  // Create SVG for connections
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '-1';

  // Root node
  const rootNodeEl = createMindMapNode(rootNode.title, true, true);
  container.appendChild(rootNodeEl);

  // Render children recursively
  if (rootNode.children && rootNode.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'mindmap-children';
    childrenContainer.style.marginLeft = '40px';

    rootNode.children.forEach((child, index) => {
      const childEl = renderMindMapChild(child, index, rootNode.children.length, svg, rootNodeEl);
      childrenContainer.appendChild(childEl);
    });

    container.appendChild(childrenContainer);
  }

  container.appendChild(svg);
  return container;
}

/**
 * Renders a single child node with connection line
 */
function renderMindMapChild(node, index, totalChildren, svg, parentNodeEl) {
  const childContainer = document.createElement('div');
  childContainer.className = 'mindmap-child-node';

  const nodeEl = createMindMapNode(node.title, false, node.expanded);
  childContainer.appendChild(nodeEl);

  // Add expand toggle if has children
  if (node.children && node.children.length > 0) {
    const toggle = document.createElement('span');
    toggle.className = 'mindmap-toggle';
    toggle.textContent = node.expanded ? '▼' : '▶';
    toggle.onclick = (e) => {
      e.stopPropagation();
      node.expanded = !node.expanded;
      toggle.textContent = node.expanded ? '▼' : '▶';
      const childrenDiv = childContainer.querySelector('.mindmap-children');
      if (childrenDiv) childrenDiv.style.display = node.expanded ? 'block' : 'none';
    };
    nodeEl.insertBefore(toggle, nodeEl.firstChild);
  }

  // If expanded and has children, render them
  if (node.expanded && node.children && node.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'mindmap-children';
    childrenContainer.style.marginLeft = '40px';

    node.children.forEach((grandchild, i) => {
      const grandchildEl = renderMindMapChild(grandchild, i, node.children.length, svg, nodeEl);
      childrenContainer.appendChild(grandchildEl);
    });

    childContainer.appendChild(childrenContainer);
  }

  // Draw connection line from parent to child
  setTimeout(() => {
    drawConnectionLine(parentNodeEl, nodeEl, svg, index, totalChildren);
  }, 0);

  return childContainer;
}

/**
 * Creates a styled node element
 */
function createMindMapNode(title, isRoot, isExpanded) {
  const node = document.createElement('div');
  node.className = `mindmap-node ${isRoot ? 'mindmap-root' : ''}`;
  node.innerHTML = `<span>${title}</span>`;
  node.onclick = () => {
    if (!isRoot) {
      node.classList.toggle('expanded');
    }
  };
  return node;
}

/**
 * Draws a curved SVG line between two nodes
 */
function drawConnectionLine(fromEl, toEl, svg, index, totalChildren) {
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();

  const fromX = fromRect.left + fromRect.width / 2 - svgRect.left;
  const fromY = fromRect.bottom - svgRect.top;
  const toX = toRect.left + toRect.width / 2 - svgRect.left;
  const toY = toRect.top - svgRect.top;

  // Calculate control points for a smooth curve
  const midY = (fromY + toY) / 2;
  const cx1 = fromX + (toX - fromX) * 0.3;
  const cy1 = fromY;
  const cx2 = toX - (toX - fromX) * 0.3;
  const cy2 = toY;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M${fromX},${fromY} C${cx1},${cy1} ${cx2},${cy2} ${toX},${toY}`);
  path.setAttribute('stroke', '#6b7280');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', '0.6');

  svg.appendChild(path);
}
/**
 * Parses the AI's markdown-style mind map output into a structured tree.
 */
function parseNotebookLMMindMap(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let root = null;
  const stack = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Central topic
      root = { title: line.slice(2), children: [], isRoot: true };
      stack.push({ node: root, depth: 0 });
    } else if (line.startsWith('## ')) {
      // Main branch (level 1)
      const node = { title: line.slice(3), children: [], isRoot: false };
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      stack.push({ node, depth: 1 });
    } else if (line.startsWith('### ')) {
      // Sub-branch (level 2)
      const node = { title: line.slice(4), children: [], isRoot: false };
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      stack.push({ node, depth: 2 });
    } else if (line.startsWith('- ')) {
      // Leaf detail (level 3)
      const detail = line.slice(2);
      const parent = stack[stack.length - 1].node;
      parent.children.push({ title: detail, children: [], isLeaf: true, isRoot: false });
    } else if (stack.length > 0) {
      // Continue current leaf or node
      const last = stack[stack.length - 1].node;
      if (last.isLeaf) {
        last.title += ' ' + line;
      } else {
        last.title += ' ' + line;
      }
    }
  }

  return root || { title: 'Mind Map', children: [], isRoot: true };
}

/**
 * Renders a vertical, NotebookLM-style mind map with colored nodes and expand arrows.
 */
function renderNotebookLMMindMap(text) {
  const container = document.createElement('div');
  container.className = 'notebooklm-mindmap';

  try {
    const parsed = parseNotebookLMMindMap(text);

    // Render root node
    const rootNode = createNodeElement(parsed.title, true);
    container.appendChild(rootNode);

    // Render children recursively
    if (parsed.children && parsed.children.length > 0) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'mindmap-children';
      childrenContainer.style.marginLeft = '40px';

      parsed.children.forEach((child, index) => {
        const childEl = renderChildNode(child, index, parsed.children.length);
        childrenContainer.appendChild(childEl);
      });

      container.appendChild(childrenContainer);
    }

  } catch (e) {
    console.warn('Failed to parse mind map, falling back to plain markdown', e);
    container.innerHTML = formatMarkdown(text);
  }

  return container;
}

/**
 * Creates a single node element with color, arrow, and click-to-expand functionality.
 */
function createNodeElement(title, isRoot) {
  const node = document.createElement('div');
  node.className = `mindmap-node ${isRoot ? 'root-node' : 'child-node'}`;
  node.innerHTML = `
    <span class="node-content">${title}</span>
    <span class="expand-arrow">▶</span>
  `;

  if (!isRoot) {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleChildren(node);
    });
  }

  return node;
}

/**
 * Renders a child node with its own children (if any).
 */
function renderChildNode(nodeData, index, totalChildren) {
  const nodeContainer = document.createElement('div');
  nodeContainer.className = 'mindmap-child-node';

  const nodeEl = createNodeElement(nodeData.title, false);
  nodeContainer.appendChild(nodeEl);

  // If node has children, render them
  if (nodeData.children && nodeData.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'mindmap-children';
    childrenContainer.style.marginLeft = '40px';
    childrenContainer.style.display = 'none'; // Initially hidden

    nodeData.children.forEach((grandchild, i) => {
      const grandchildEl = renderChildNode(grandchild, i, nodeData.children.length);
      childrenContainer.appendChild(grandchildEl);
    });

    nodeContainer.appendChild(childrenContainer);

    // Store reference for toggling
    nodeEl.dataset.hasChildren = 'true';
    nodeEl.dataset.childrenContainer = 'childrenContainer';
  }

  return nodeContainer;
}

/**
 * Toggles the visibility of a node's children.
 */
function toggleChildren(node) {
  const childrenContainer = node.nextElementSibling;
  if (childrenContainer && childrenContainer.classList.contains('mindmap-children')) {
    const isVisible = childrenContainer.style.display === 'block';
    childrenContainer.style.display = isVisible ? 'none' : 'block';
    const arrow = node.querySelector('.expand-arrow');
    arrow.textContent = isVisible ? '▶' : '▼';
  }
}
function renderMindMapFromJSON(data) {
  const container = document.createElement('div');
  container.className = 'mindmap-json-container';

  // Render root node (always expanded by default, but can be collapsed)
  const rootNode = createCollapsibleNode(
    data.root,
    true, // isRoot
    'root-node'
  );
  container.appendChild(rootNode);

  // Render branches under root
  const rootChildrenContainer = document.createElement('div');
  rootChildrenContainer.className = 'mindmap-children';
  rootChildrenContainer.style.marginLeft = '30px';
  rootChildrenContainer.style.display = 'block'; // Start expanded

  if (data.branches && Array.isArray(data.branches)) {
    data.branches.forEach(branch => {
      const branchNode = createCollapsibleNode(branch.title, false, 'branch-title');
      rootChildrenContainer.appendChild(branchNode);

      // Children container for this branch
      const branchChildrenContainer = document.createElement('div');
      branchChildrenContainer.className = 'mindmap-children';
      branchChildrenContainer.style.marginLeft = '20px';
      branchChildrenContainer.style.display = 'none'; // Start collapsed

      if (branch.children && Array.isArray(branch.children)) {
        branch.children.forEach(child => {
          const childNode = document.createElement('div');
          childNode.className = 'mindmap-node child-node';
          childNode.textContent = child;
          branchChildrenContainer.appendChild(childNode);
        });
      }

      rootChildrenContainer.appendChild(branchChildrenContainer);

      // Attach toggle behavior to branch node
      setupToggleBehavior(branchNode, branchChildrenContainer);
    });
  }

  container.appendChild(rootChildrenContainer);

  // Attach toggle behavior to root node
  setupToggleBehavior(rootNode, rootChildrenContainer);

  return container;
}

/**
 * Creates a styled, collapsible node element
 */
function createCollapsibleNode(title, isRoot, className) {
  const node = document.createElement('div');
  node.className = `mindmap-node ${className}`;
  node.innerHTML = `
    <span class="node-content">${title}</span>
    <span class="expand-arrow">${isRoot ? '▼' : '▶'}</span>
  `;
  return node;
}

/**
 * Sets up click-to-toggle behavior for a node
 */
function setupToggleBehavior(node, childrenContainer) {
  const expandArrow = node.querySelector('.expand-arrow');
  
  // Hide arrow for leaf nodes (no children container)
  if (!childrenContainer) {
    if (expandArrow) expandArrow.style.display = 'none';
    return;
  }

  node.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = childrenContainer.style.display === 'block';
    childrenContainer.style.display = isVisible ? 'none' : 'block';
    expandArrow.textContent = isVisible ? '▶' : '▼';
  });
}