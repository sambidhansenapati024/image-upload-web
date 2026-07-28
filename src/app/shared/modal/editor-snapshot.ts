import { EditorState } from './editor-state';
import { ViewportState } from './viewport-state';

export interface EditorSnapshot {
   editorState: EditorState;

    viewportState: ViewportState;
}