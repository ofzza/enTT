// Routing module
// Defines application routes and registers them with the app
// ----------------------------------------------------------------------------

// Import modules
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShowcaseAppModule, ShowcaseBasedRouting } from '@ofzza/ngx-showcase';

// Import pages
import { routes as pageRoutes } from './routes';

// Define routes
const routes: Routes = [
  // Generated component pages' routes
  ...ShowcaseBasedRouting.generateRoutingModuleRoutes(pageRoutes),
  // Redirect to default
  { path: '**', redirectTo: '/' },
];

/**
 * Routing module
 * Defines application routes and registers them with the app
 */
@NgModule({
  imports: [RouterModule.forRoot(routes), ShowcaseAppModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
