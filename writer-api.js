class WriterAPIHandler {
  constructor() {
    this.writer = null;
    this.currentOptions = {
      tone: 'neutral',
      format: 'markdown',
      length: 'medium'
    };
  }

  async checkAvailability() {
    try {
      if (typeof Writer === 'undefined') return 'unavailable';
  return await Writer.availability();
}
      
     catch (error) {
      console.error('Writer availability check failed:', error);
      return 'unavailable';
    }
  }

  async createWriter(options = {}) {
    try {
      this.currentOptions = { ...this.currentOptions, ...options };

      const writerOptions = {
        tone: this.currentOptions.tone,
        format: this.currentOptions.format,
        length: this.currentOptions.length,
        monitor(m) {
  m.addEventListener('downloadprogress', (e) => {
    console.log(`Prompt model download: ${Math.round(e.loaded * 100)}%`);
    // Optional: show per-message loading spinner, but NOT global status
  });
}
      };

      if (this.currentOptions.sharedContext) {
        writerOptions.sharedContext = this.currentOptions.sharedContext;
      }

      if (this.writer) {
        this.writer.destroy();
      }

      this.writer = await Writer.create(writerOptions);
      return true;
    } catch (error) {
      console.error('Failed to create writer:', error);
      throw error;
    }
  }

  async write(prompt, context = '') {
    if (!this.writer) {
      await this.createWriter();
    }

    try {
      const options = context ? { context } : {};
      return await this.writer.write(prompt, options);
    } catch (error) {
      console.error('Writing failed:', error);
      throw error;
    }
  }

  async writeStreaming(prompt, context = '') {
    if (!this.writer) {
      await this.createWriter();
    }

    try {
      const options = context ? { context } : {};
      return this.writer.writeStreaming(prompt, options);
    } catch (error) {
      console.error('Streaming writing failed:', error);
      throw error;
    }
  }

  updateOptions(options) {
    const needsRecreate =
      options.tone !== this.currentOptions.tone ||
      options.format !== this.currentOptions.format ||
      options.length !== this.currentOptions.length ||
      options.sharedContext !== this.currentOptions.sharedContext;

    this.currentOptions = { ...this.currentOptions, ...options };

    return needsRecreate;
  }

  destroy() {
    if (this.writer) {
      this.writer.destroy();
      this.writer = null;
    }
  }
}

function formatWriterOutput(text) {
  const container = document.createElement('div');
  container.className = 'writer-output';
  container.innerHTML = formatMarkdown(text);
  return container;
}
