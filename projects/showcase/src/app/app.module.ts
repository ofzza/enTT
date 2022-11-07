// Main entt showcase app's application module
// ----------------------------------------------------------------------------

// Import modules
import '@angular/compiler';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
// Import ngx-showcase library's showcase application components
import { ShowcaseAppModule } from '@ofzza/ngx-showcase';

// Import main application component
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, ShowcaseAppModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
