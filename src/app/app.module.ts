import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SheetOverlayComponent } from './sheet-overlay/sheet-overlay.component';
import { LineEditorComponent } from './line-editor/line-editor.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { StaffGrouperComponent } from './staff-grouper/staff-grouper.component';
import { DebugComponent } from './debug/debug.component';
import { SymbolEditorComponent } from './symbol-editor/symbol-editor.component';
import { RectEditorComponent } from './rect-editor/rect-editor.component';
import { LyricsEditorComponent } from './lyrics-editor/lyrics-editor.component';
import {FormsModule} from '@angular/forms';
import { AutoInputResizeDirective } from './autoinputresize.directive';
import { PagesPreviewComponent } from './pages-preview/pages-preview.component';
import {HttpModule} from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    SheetOverlayComponent,
    LineEditorComponent,
    ToolBarComponent,
    StaffGrouperComponent,
    DebugComponent,
    SymbolEditorComponent,
    RectEditorComponent,
    LyricsEditorComponent,
    AutoInputResizeDirective,
    PagesPreviewComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
