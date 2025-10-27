# Personal Data Storage and Retrieval System Design

## Overview

The Personal Data Storage and Retrieval System is a client-side JavaScript solution that automatically extracts, categorizes, stores, and utilizes personal information from user conversations to enhance AI interactions. The system operates entirely within the browser using localStorage, ensuring complete privacy and user control.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Chat Interface  │  Data Manager UI  │  Notifications      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Personal Data Manager                       │
├─────────────────────────────────────────────────────────────┤
│  Data Extraction │  Context Generation │  Storage Manager   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Browser Storage                          │
├─────────────────────────────────────────────────────────────┤
│           localStorage (Personal Data + History)            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input Processing**: User message → Data extraction → Categorization → Storage
2. **Context Enhancement**: Stored data → Context generation → Enhanced prompt → AI model
3. **User Management**: Storage → UI display → User actions → Storage updates

## Components and Interfaces

### 1. PersonalDataManager Class

**Primary Interface:**
```javascript
class PersonalDataManager {
  constructor()
  extractAndStore(userMessage) → extractedData | null
  generateContext() → string
  getAllData() → object
  clearAllData() → void
  exportData() → string
  importData(jsonData) → boolean
  getDataSummary() → object
}
```

**Key Methods:**
- `extractAndStore()`: Main extraction pipeline
- `generateContext()`: Creates contextual information for AI prompts
- Data management methods for CRUD operations

### 2. Data Extraction Engine

**Pattern-Based Extractors:**
```javascript
extractPersonalInfo(message) → {name, age, location, occupation, email, phone}
extractPreferences(message) → {likes, dislikes, favorites}
extractEvents(message) → [{type, details, timestamp}]
extractWorkInfo(message) → {company, position, colleagues, projects}
extractFamilyInfo(message) → {spouse, children, parents}
extractHealthInfo(message) → {conditions, medications, allergies}
extractGoals(message) → [{goal, timestamp}]
```

**Extraction Patterns:**
- **Personal Info**: Regex patterns for "my name is", "I'm", "I live in", etc.
- **Preferences**: Pattern matching for "I like", "I hate", "my favorite", etc.
- **Events**: Temporal expressions with event keywords
- **Work**: Company names, job titles, project mentions
- **Goals**: Future-oriented language patterns

### 3. Storage Manager

**Data Structure:**
```javascript
{
  personal: {name, age, location, occupation, email, phone},
  preferences: {likes: [], dislikes: [], favorites: []},
  events: [{type, details, timestamp, text}],
  work: {company, position, colleagues: [], projects: []},
  family: {spouse, children: [], parents: []},
  health: {conditions: [], medications: [], allergies: []},
  goals: [{goal, timestamp, text}],
  memories: [{text, timestamp, extractedData}],
  chatHistory: [{
    id: string,
    timestamp: string,
    userMessage: string,
    assistantResponse: string,
    topic: string,
    extractedData: object
  }],
  lastUpdated: timestamp
}
```

**Storage Operations:**
- Automatic data merging and deduplication
- Memory management with size limits (100 recent memories)
- Chat history storage with conversation threading
- Conversation search and retrieval by topic/date
- JSON serialization for export/import
- Data validation and error handling

### 4. Context Generation Engine

**Context Prioritization:**
1. Recent personal information (name, current location, job)
2. Relevant preferences based on conversation topic
3. Upcoming events (next 7 days)
4. Active goals and projects
5. Recent conversation history (last 5-10 exchanges)
6. Related past conversations based on topic similarity

**Context Formatting:**
```
Personal context: name: John, occupation: software developer; 
likes: pizza, coffee; Recent events: meeting tomorrow at 2 PM; 
Goals: learn Spanish, visit Spain
```

### 5. User Interface Components

**Notification System:**
- Slide-in notifications for new data extraction
- Auto-dismiss after 10 seconds
- Manual dismiss option
- Quick access to data manager

**Data Management Modal:**
- Categorized data display
- Summary statistics dashboard
- Export/Import functionality
- Clear data with confirmation
- Search and filter capabilities

**Integration Points:**
- Chat interface enhancement
- Personal data button in controls
- Context injection in message processing

## Data Models

### Core Data Types

```typescript
interface PersonalData {
  personal: PersonalInfo;
  preferences: Preferences;
  events: Event[];
  work: WorkInfo;
  family: FamilyInfo;
  health: HealthInfo;
  goals: Goal[];
  memories: Memory[];
  lastUpdated: string;
}

interface PersonalInfo {
  name?: string;
  age?: string;
  location?: string;
  occupation?: string;
  email?: string;
  phone?: string;
}

interface Event {
  type: string;
  details: string;
  timestamp: string;
  text: string;
}

interface Memory {
  text: string;
  timestamp: string;
  extractedData: Partial<PersonalData>;
}
```

### Pattern Definitions

**Extraction Patterns:**
- Name: `/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i`
- Age: `/(?:i'm|i am|my age is)\s+(\d+)\s*(?:years old)?/i`
- Location: `/(?:i live in|i'm from|i'm in|located in)\s+([a-zA-Z\s,]+)/i`
- Preferences: `/(?:i like|i love|i enjoy|i prefer)\s+([^.!?]+)/gi`
- Events: `/(?:i have a|there's a|my)\s+(meeting|appointment|deadline)\s+(?:on|at)?\s*([^.!?]+)/gi`

## Error Handling

### Data Extraction Errors
- **Invalid Patterns**: Graceful fallback, log warnings
- **Storage Failures**: User notification, retry mechanism
- **Data Corruption**: Validation and recovery procedures

### Storage Management
- **Quota Exceeded**: Automatic cleanup of old data
- **JSON Parse Errors**: Data validation and sanitization
- **Import Failures**: User feedback and error details

### UI Error States
- **Loading States**: Progress indicators during operations
- **Network Issues**: Offline capability maintenance
- **Browser Compatibility**: Feature detection and fallbacks

## Testing Strategy

### Unit Testing
- **Data Extraction**: Pattern matching accuracy tests
- **Storage Operations**: CRUD functionality validation
- **Context Generation**: Output format and relevance tests
- **Data Validation**: Input sanitization and error handling

### Integration Testing
- **Chat Flow**: End-to-end message processing
- **UI Interactions**: Modal operations and notifications
- **Storage Persistence**: Cross-session data retention
- **Export/Import**: Data integrity verification

### User Experience Testing
- **Extraction Accuracy**: Real conversation data testing
- **Performance**: Large dataset handling
- **Privacy**: Data isolation verification
- **Accessibility**: Screen reader and keyboard navigation

## Security and Privacy

### Data Protection
- **Local-Only Storage**: No external data transmission
- **Data Encryption**: Optional localStorage encryption
- **User Consent**: Clear data collection notifications
- **Data Minimization**: Automatic cleanup and limits

### Privacy Controls
- **Transparency**: Full data visibility for users
- **Control**: Complete data management capabilities
- **Deletion**: Secure data removal options
- **Export**: User data portability

## Performance Considerations

### Storage Optimization
- **Data Compression**: JSON minification
- **Memory Limits**: Automatic old data cleanup
- **Indexing**: Efficient data retrieval patterns
- **Caching**: Context generation optimization

### UI Performance
- **Lazy Loading**: On-demand data rendering
- **Virtual Scrolling**: Large dataset display
- **Debounced Operations**: Reduced storage writes
- **Progressive Enhancement**: Core functionality first

## Implementation Phases

### Phase 1: Core Data Management
- PersonalDataManager class implementation
- Basic extraction patterns
- localStorage integration
- Data structure definition

### Phase 2: UI Integration
- Chat interface integration
- Notification system
- Basic data management modal
- Context injection

### Phase 3: Advanced Features
- Enhanced extraction patterns
- Export/import functionality
- Advanced UI features
- Performance optimizations

### Phase 4: Polish and Testing
- Comprehensive testing suite
- Error handling improvements
- Accessibility enhancements
- Documentation completion