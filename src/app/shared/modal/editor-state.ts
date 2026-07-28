import { CropArea } from "./crop-area";
import { ShapeElement } from "./shape-element";
import { TextElement } from "./text-element";

export interface EditorState {

    rotation: number;

    flipX: boolean;

    flipY: boolean;

    brightness: number;

    contrast: number;

    saturation: number;

    crop?: CropArea;

    filter: 'none' | 'grayscale' | 'sepia';

    textElements: TextElement[];

    shapeElements: ShapeElement[];

}