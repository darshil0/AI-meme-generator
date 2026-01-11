import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemeEditorComponent } from './components/meme-editor/meme-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemeEditorComponent],
})
export class AppComponent {}
