class SummarizerAPIHandler {
  constructor() {
    this.summarizer = null;
    this.currentOptions = {
      type: 'key-points',
      format: 'markdown',
      length: 'medium'
    };
  }

  async checkAvailability() {
    try {
      if (typeof Summarizer === 'undefined') return 'unavailable';
  return await Summarizer.availability();
}
      
     catch (error) {
      console.error('Summarizer availability check failed:', error);
      return 'unavailable';
    }
  }

  async createSummarizer(options = {}) {
  this.currentOptions = { ...this.currentOptions, ...options };

  if (!navigator.userActivation.isActive) {
    throw new Error('User activation required');
  }

  const summarizerOptions = {
    type: this.currentOptions.type,
    format: this.currentOptions.format,
    length: this.currentOptions.length,
    monitor(m) {
  m.addEventListener('downloadprogress', (e) => {
    console.log(`Prompt model download: ${Math.round(e.loaded * 100)}%`);
    // Optional: show per-message loading spinner, but NOT global status
  });
}
  };

  if (this.summarizer) this.summarizer.destroy();
  this.summarizer = await Summarizer.create(summarizerOptions);
}

  async summarize(text, context = '') {
    if (!this.summarizer) {
      await this.createSummarizer();
    }

    try {
      const options = context ? { context } : {};
      return await this.summarizer.summarize(text, options);
    } catch (error) {
      console.error('Summarization failed:', error);
      throw error;
    }
  }

  async summarizeStreaming(text, context = '') {
    if (!this.summarizer) {
      await this.createSummarizer();
    }

    try {
      const options = context ? { context } : {};
      return this.summarizer.summarizeStreaming(text, options);
    } catch (error) {
      console.error('Streaming summarization failed:', error);
      throw error;
    }
  }

  updateOptions(options) {
    const needsRecreate =
      options.type !== this.currentOptions.type ||
      options.format !== this.currentOptions.format ||
      options.length !== this.currentOptions.length;

    this.currentOptions = { ...this.currentOptions, ...options };

    return needsRecreate;
  }

  destroy() {
    if (this.summarizer) {
      this.summarizer.destroy();
      this.summarizer = null;
    }
  }
}

function formatSummaryOutput(text, type) {
  const container = document.createElement('div');
  container.className = 'summary-output';

  if (type === 'key-points') {
    container.innerHTML = formatMarkdown(text);
  } else {
    container.innerHTML = `<p>${text}</p>`;
  }

  return container;
}
