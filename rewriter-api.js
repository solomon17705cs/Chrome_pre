class RewriterAPIHandler {
  constructor() {
    this.rewriter = null;
    this.currentOptions = {
      tone: 'as-is',
      format: 'as-is',
      length: 'as-is'
    };
  }

  async checkAvailability() {
    try {
      if (typeof Rewriter === 'undefined') return 'unavailable';
  return await Rewriter.availability();
}
      catch (error) {
      console.error('Rewriter availability check failed:', error);
      return 'unavailable';
    }
  }

  async createRewriter(options = {}) {
    try {
      this.currentOptions = { ...this.currentOptions, ...options };

      const rewriterOptions = {
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
        rewriterOptions.sharedContext = this.currentOptions.sharedContext;
      }

      if (this.rewriter) {
        this.rewriter.destroy();
      }

      this.rewriter = await Rewriter.create(rewriterOptions);
      return true;
    } catch (error) {
      console.error('Failed to create rewriter:', error);
      throw error;
    }
  }

  async rewrite(text, context = '') {
    if (!this.rewriter) {
      await this.createRewriter();
    }

    try {
      const options = context ? { context } : {};
      return await this.rewriter.rewrite(text, options);
    } catch (error) {
      console.error('Rewriting failed:', error);
      throw error;
    }
  }

  async rewriteStreaming(text, context = '') {
    if (!this.rewriter) {
      await this.createRewriter();
    }

    try {
      const options = context ? { context } : {};
      return this.rewriter.rewriteStreaming(text, options);
    } catch (error) {
      console.error('Streaming rewriting failed:', error);
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
    if (this.rewriter) {
      this.rewriter.destroy();
      this.rewriter = null;
    }
  }
}

function formatRewriterOutput(text) {
  const container = document.createElement('div');
  container.className = 'rewriter-output';
  container.innerHTML = formatMarkdown(text);
  return container;
}
