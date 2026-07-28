import { Injectable } from '@angular/core';
import { EditorSnapshot } from '../../modal/editor-snapshot';
import { EditorState } from '../../modal/editor-state';
import { ViewportState } from '../../modal/viewport-state';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
private undoStack: EditorSnapshot[] = [];

private redoStack: EditorSnapshot[] = [];
push(
    editorState: EditorState,
    viewportState: ViewportState
): void {

    this.undoStack.push({

        editorState: structuredClone(editorState),

        viewportState: structuredClone(viewportState)

    });

    this.redoStack = [];

}

undo(
    currentEditorState: EditorState,
    currentViewportState: ViewportState
): EditorSnapshot | null {

    if (this.undoStack.length === 0) {
        return null;
    }

    this.redoStack.push({

        editorState: structuredClone(currentEditorState),

        viewportState: structuredClone(currentViewportState)

    });

    return this.undoStack.pop()!;

}

redo(
    currentEditorState: EditorState,
    currentViewportState: ViewportState
): EditorSnapshot | null {

    if (this.redoStack.length === 0) {
        return null;
    }

    this.undoStack.push({

        editorState: structuredClone(currentEditorState),

        viewportState: structuredClone(currentViewportState)

    });

    return this.redoStack.pop()!;

}

  clear(): void {

    this.undoStack = [];

    this.redoStack = [];

  }
}
