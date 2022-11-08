// Main entt showcase app's application module
// ----------------------------------------------------------------------------

// Import modules
import '@angular/compiler';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
// Import ngx-showcase library's showcase application components
import { ShowcaseAppModule } from '@ofzza/ngx-showcase';

// Import main application component and pages
import { AppComponent } from './app.component';
import { FrontpageComponent } from './pages';
const pages = [FrontpageComponent];

@NgModule({
  declarations: [AppComponent, ...pages],
  imports: [BrowserModule, AppRoutingModule, ShowcaseAppModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
