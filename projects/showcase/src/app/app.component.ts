// Showcase application main component
// ----------------------------------------------------------------------------

// Import dependencies
import { Component } from '@angular/core';
import { MarkdownService, HighlightService } from '@ofzza/ngx-showcase';

// Import pages
import { routes } from './routes';

// Import highlight.js languages
// import xml from 'highlight.js/lib/languages/xml';
// import javascript from 'highlight.js/lib/languages/javascript';
// import css from 'highlight.js/lib/languages/css';

/**
 * Showcase application main component
 */
@Component({
  selector: 'app-root',
  template: '<ngx-showcase-app-page title="ENTT SHOWCASE" [routes]="_routes"></ngx-showcase-app-page>',
  styleUrls: [],
})
export class AppComponent {
  /**
   * Showcase registered routes
   */
  public _routes = routes;

  constructor(highlight: HighlightService) {
    // Register highlighting languages
    // highlight.registerLanguage(['xml', 'html'], xml);
    // highlight.registerLanguage(['js', 'javascript'], javascript);
    // highlight.registerLanguage(['css'], css);
  }
}
