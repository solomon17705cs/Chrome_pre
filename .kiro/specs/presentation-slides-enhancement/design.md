# Design Document

## Overview

This design enhances the presentation mode in the AIO Chrome Extension by implementing a slide container system that visually separates individual slides with blue line borders, similar to the existing roadmap feature. The enhancement will parse AI-generated slide content and render each slide in a distinct visual container while maintaining compatibility with existing functionality.

## Architecture

### Current Architecture
- **prompt-api.js**: Contains the `displayContent()` function that handles content rendering for different modes
- **styles.css**: Contains styling for roadmap steps with blue line separators
- **AI Prompt System**: Generates slide content in "SLIDE X:" format
- **Google Slides Export**: Existing functionality to export slides to Google Slides

### Enhanced Architecture
- **Slide Parser**: New parsing logic within `displayContent()` to identify and separate individual slides
- **Slide Container Renderer**: New rendering logic to create visual containers for each slide
- **Slide Styling**: New CSS classes based on existing roadmap styling patterns
- **Backward Compatibility**: Fallback to existing markdown rendering for malformed content

## Components and Interfaces

### 1. Slide Parser Component

**Location**: `prompt-api.js` within the `displayContent()` function

**Functionality**:
- Parse text content to identify slide boundaries using "SLIDE X:" markers
- Extract slide titles and content
- Handle edge cases (missing slides, malformed content)

**Interface**:
```javascript
function parseSlides(text) {
  // Returns array of slide objects: [{title, content}, ...]
}
```

### 2. Slide Container Renderer

**Location**: `prompt-api.js` within the `displayContent()` function

**Functionality**:
- Create DOM elements for each slide container
- Apply appropriate CSS classes
- Render slide content with markdown formatting

**Interface**:
```javascript
function renderSlideContainer(slide, index) {
  // Returns DOM element for individual slide
}
```

### 3. Slide Styling System

**Location**: `styles.css`

**New CSS Classes**:
- `.slide-container`: Main container styling (based on `.roadmap-step`)
- `.slide-title`: Slide title styling (based on `.roadmap-step h3`)
- `.slide-content`: Slide content area styling

## Data Models

### Slide Object Model
```javascript
{
  title: string,        // e.g., "Title Slide", "Introduction"
  content: string,      // Markdown formatted content
  slideNumber: number   // 1, 2, 3, etc.
}
```

### Parsed Content Structure
```javascript
{
  slides: [Slide],      // Array of slide objects
  isValid: boolean,     // Whether parsing was successful
  rawContent: string    // Original content for fallback
}
```

## Error Handling

### Parsing Errors
- **No slide markers found**: Fall back to default markdown rendering
- **Malformed slide content**: Display individual slides that were successfully parsed, show error for malformed ones
- **Empty content**: Display appropriate message

### Rendering Errors
- **DOM creation failures**: Fall back to plain text display
- **CSS loading issues**: Ensure basic functionality without styling

### Backward Compatibility
- Maintain existing Google Slides export functionality
- Preserve all current slide content structure
- Ensure mode switching continues to work properly

## Testing Strategy

### Unit Testing Focus
- Slide parsing logic with various input formats
- Container rendering with different slide types
- Error handling for malformed content

### Integration Testing Focus
- End-to-end slide generation and display
- Mode switching between presentation and other modes
- Google Slides export functionality preservation

### Visual Testing Focus
- Slide container appearance matches roadmap styling
- Proper spacing and alignment
- Responsive behavior

## Implementation Details

### CSS Implementation
The slide containers will reuse the successful design pattern from roadmap steps:

```css
.slide-container {
  padding: 16px;
  background: white;
  border-left: 3px solid #2563eb;
  margin-bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.slide-title {
  color: #2563eb;
  margin-bottom: 8px;
  font-weight: bold;
}
```

### JavaScript Implementation
Add a new case for 'powerpoint' in the `displayContent()` function:

```javascript
case 'powerpoint':
  const slides = parseSlides(text);
  slides.forEach((slide, index) => {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide-container';
    slideDiv.innerHTML = `
      <div class="slide-title">${slide.title}</div>
      <div class="slide-content">${formatMarkdown(slide.content)}</div>
    `;
    container.appendChild(slideDiv);
  });
  break;
```

### Parsing Logic
The parser will identify slides using regex patterns:
- Match "SLIDE X:" patterns to identify slide boundaries
- Extract titles and content between slide markers
- Handle various formatting variations in AI-generated content

## Performance Considerations

- **Minimal DOM manipulation**: Create containers efficiently
- **CSS reuse**: Leverage existing roadmap styling to minimize CSS overhead
- **Parsing efficiency**: Use simple regex patterns for slide identification
- **Memory management**: Avoid creating unnecessary DOM elements

## Accessibility Considerations

- **Semantic HTML**: Use appropriate heading tags for slide titles
- **ARIA labels**: Add appropriate labels for slide containers
- **Keyboard navigation**: Ensure slide containers are properly focusable
- **Screen reader support**: Maintain logical content structure