import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemeEditorComponent } from './components/meme-editor/meme-editor.component';

/**
 * Root component of the AI Meme Generator application,
 * serving as the shell container for header, landing hero, and MemeEditorComponent.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemeEditorComponent],
})
export class AppComponent {
  /**
   * Smoothly scrolls the viewport to the meme editor section.
   */
  scrollToEditor(): void {
    document.getElementById('meme-editor')?.scrollIntoView({ behavior: 'smooth' });
  }
}
