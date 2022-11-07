// Register of all showcasing pages' routes
// ----------------------------------------------------------------------------

// Import dependencies
import { Route, ShowcaseBasedRouting, ShowcaseArtifactTypes } from '@ofzza/ngx-showcase';

/**
 * Showcase pages' routes
 */
export const routes = [
  // EnTT library basics
  new Route('enTT library', 'lib', undefined, {}, undefined, [
    // Library basics
    // ShowcaseBasedRouting.createRouteFromArtifact(null, ShowcaseArtifactTypes.Pipe, ExtractInnerSyntaxPipeShowcase),
  ]),
  // EnTT library basics
  new Route('enTT decorators', 'decorators', undefined, {}, undefined, []),
];
