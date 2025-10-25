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
  return `You are an expert at creating visual mind maps. Your task is to generate a hierarchical mind map as a JSON object with the following structure:
{
  "root": "Central Topic Title",
  "branches": [
    {
      "title": "Main Branch 1",
      "children": ["Detail 1", "Detail 2"]
    }
  ]
}
Rules:
1. The root must be a short, clear title.
2. Include 2-4 main branches.
3. Each branch must have 2-4 children (leaf details).
4. Use concise, meaningful text.
5. Return ONLY valid JSON. No extra text, no markdown, no explanation.
Now create a mind map for:`;

      case 'roadmap':
        return `Create a detailed roadmap with clear steps and timelines. Format as:
# Project Roadmap

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
    this.currentMode = mode;
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

function formatPromptOutput(text, mode) {
  const container = document.createElement('div');
  container.className = 'output-container';
  document.getElementById('exportToSlidesBtn').style.display = 'block';

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

    default:
      container.innerHTML = formatMarkdown(text);
  }

  return container;
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

  // Root node
  const rootNode = document.createElement('div');
  rootNode.className = 'mindmap-node root-node';
  rootNode.textContent = data.root;
  container.appendChild(rootNode);

  // Branches
  if (data.branches && Array.isArray(data.branches)) {
    const branchesContainer = document.createElement('div');
    branchesContainer.className = 'mindmap-branches';
    branchesContainer.style.marginLeft = '30px';

    data.branches.forEach(branch => {
      const branchEl = document.createElement('div');
      branchEl.className = 'mindmap-branch';

      const branchTitle = document.createElement('div');
      branchTitle.className = 'mindmap-node branch-title';
      branchTitle.textContent = branch.title;
      branchEl.appendChild(branchTitle);

      if (branch.children && Array.isArray(branch.children)) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'mindmap-children';
        childrenContainer.style.marginLeft = '20px';

        branch.children.forEach(child => {
          const childEl = document.createElement('div');
          childEl.className = 'mindmap-node child-node';
          childEl.textContent = child;
          childrenContainer.appendChild(childEl);
        });

        branchEl.appendChild(childrenContainer);
      }

      branchesContainer.appendChild(branchEl);
    });

    container.appendChild(branchesContainer);
  }

  return container;
}