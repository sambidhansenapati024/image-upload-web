import { Injectable } from '@angular/core';
import { EditorState } from '../../modal/editor-state';
import { ViewportState } from '../../modal/viewport-state';
import { TextElement } from '../../modal/text-element';
import { ShapeElement } from '../../modal/shape-element';

@Injectable({
    providedIn: 'root'
})
export class CanvasService {

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private image = new Image();

    initialize(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }

    async loadImage(url: string): Promise<void> {
        return new Promise((resolve) => {

            this.image.crossOrigin = 'anonymous';
            this.image.src = url;

            this.image.onload = () => {
                this.render(
                    this.createDefaultState(),
                    this.createDefaultViewport()
                )
                resolve();
            };

        });
    }

    render(
        state: EditorState,
        viewport: ViewportState,
        selectedTextId: number | null = null,
        selectedShapeId: number | null = null
    ): void {

        this.prepareCanvas(state);

        this.drawImage(
            state,
            viewport
        );
        this.applyCrop(state);

        this.applyPixelAdjustments(state);

        this.drawShapes(
            state.shapeElements,
            selectedShapeId
        );

        this.drawText(
            state.textElements,
            selectedTextId
        );

    }


    private applyBrightness(pixels: Uint8ClampedArray, brightness: number): void {

        if (brightness === 0) {
            return;
        }

        for (let i = 0; i < pixels.length; i += 4) {

            pixels[i] += brightness;
            pixels[i + 1] += brightness;
            pixels[i + 2] += brightness;

        }

    }

    private applyContrast(pixels: Uint8ClampedArray, contrast: number): void {

        if (contrast === 0) {
            return;
        }

        const factor =
            (259 * (contrast + 255)) /
            (255 * (259 - contrast));

        for (let i = 0; i < pixels.length; i += 4) {

            pixels[i] = factor * (pixels[i] - 128) + 128;
            pixels[i + 1] = factor * (pixels[i + 1] - 128) + 128;
            pixels[i + 2] = factor * (pixels[i + 2] - 128) + 128;

        }

    }

    private applySaturation(
        pixels: Uint8ClampedArray,
        saturation: number
    ): void {

        if (saturation === 0) {
            return;
        }

        const factor = 1 + saturation / 100;

        for (let i = 0; i < pixels.length; i += 4) {

            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            const gray = 0.2989 * r + 0.587 * g + 0.114 * b;

            pixels[i] = gray + (r - gray) * factor;
            pixels[i + 1] = gray + (g - gray) * factor;
            pixels[i + 2] = gray + (b - gray) * factor;

        }

    }

    private createDefaultState(): EditorState {
        return {
            rotation: 0,
            flipX: false,
            flipY: false,
            brightness: 0,
            contrast: 0,
            saturation: 0,
            filter: 'none',
            textElements: [],
            shapeElements: [],
        };
    }

    private createDefaultViewport(): ViewportState {

        return {

            zoom: 1,

            panX: 0,

            panY: 0

        };

    }



    getCanvas(): HTMLCanvasElement {

        return this.canvas;

    }

    private prepareCanvas(state: EditorState): void {

        if (state.rotation === 90 || state.rotation === 270) {

            this.canvas.width = this.image.height;
            this.canvas.height = this.image.width;

        } else {

            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;

        }

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

    private drawImage(
        state: EditorState,
        viewport: ViewportState
    ): void {

        const angle = state.rotation * Math.PI / 180;

        this.ctx.save();

        this.ctx.translate(
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        this.ctx.rotate(angle);

        this.ctx.scale(
            (state.flipX ? -1 : 1) * viewport.zoom,
            (state.flipY ? -1 : 1) * viewport.zoom
        );

        this.ctx.drawImage(
            this.image,
            -this.image.width / 2,
            -this.image.height / 2
        );

        this.ctx.restore();

    }
    private applyPixelAdjustments(state: EditorState): void {

        const imageData = this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        const pixels = imageData.data;

        this.applyBrightness(
            pixels,
            state.brightness
        );

        this.applyContrast(
            pixels,
            state.contrast
        );

        this.applySaturation(
            pixels,
            state.saturation
        );

        this.applyFilter(imageData, state.filter);

        this.ctx.putImageData(
            imageData,
            0,
            0
        );

    }

    private applyCrop(state: EditorState): void {

        if (!state.crop) {
            return;
        }

        const crop = state.crop;

        const tempCanvas = document.createElement('canvas');

        tempCanvas.width = crop.width;
        tempCanvas.height = crop.height;

        const tempCtx = tempCanvas.getContext('2d')!;

        tempCtx.drawImage(

            this.canvas,

            crop.x,
            crop.y,

            crop.width,
            crop.height,

            0,
            0,

            crop.width,
            crop.height

        );

        this.canvas.width = crop.width;
        this.canvas.height = crop.height;

        this.ctx.drawImage(
            tempCanvas,
            0,
            0
        );

    }

    private applyFilter(
        imageData: ImageData,
        filter: 'none' | 'grayscale' | 'sepia'
    ): void {

        if (filter === 'none') {
            return;
        }

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (filter === 'grayscale') {

                const gray = (r + g + b) / 3;

                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;

            }

            else if (filter === 'sepia') {

                data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
                data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
                data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);

            }

        }

    }

    private drawShapes(
    shapeElements: ShapeElement[],
     selectedShapeId: number | null
): void {

    for (const shape of shapeElements) {

        this.ctx.save();

        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;

        this.ctx.translate(
            centerX,
            centerY
        );

        this.ctx.rotate(
            shape.rotation * Math.PI / 180
        );

        // Fill
        if (shape.fillColor !== 'transparent') {

            this.ctx.fillStyle = shape.fillColor;

            this.ctx.fillRect(
                -shape.width / 2,
                -shape.height / 2,
                shape.width,
                shape.height
            );

        }

        // Border
// Border
this.ctx.strokeStyle = shape.strokeColor;

this.ctx.lineWidth = shape.strokeWidth;

this.ctx.strokeRect(
    -shape.width / 2,
    -shape.height / 2,
    shape.width,
    shape.height
);

        if (shape.id === selectedShapeId) {

    // Blue selection border
    this.ctx.strokeStyle = '#2196F3';
    this.ctx.lineWidth = 2;


    // Resize handle
    this.ctx.fillStyle = '#2196F3';

    this.ctx.fillRect(
        shape.width / 2 + 2,
        shape.height / 2 + 2,
        10,
        10
    );

    // Rotation line
    this.ctx.beginPath();

    this.ctx.moveTo(
        0,
        -shape.height / 2
    );

    this.ctx.lineTo(
        0,
        -shape.height / 2 - 20
    );

    this.ctx.stroke();

    // Rotation handle
    this.ctx.beginPath();

    this.ctx.arc(
        0,
        -shape.height / 2 - 20,
        6,
        0,
        Math.PI * 2
    );

    this.ctx.fill();
}

        this.ctx.restore();

    }

}

   private drawText(
    textElements: TextElement[],
    selectedTextId: number | null
): void {

    for (const text of textElements) {

        this.ctx.save();

        this.ctx.font =
            `${text.bold ? 'bold ' : ''}${text.fontSize}px ${text.fontFamily}`;

        this.ctx.fillStyle = text.color;

        const metrics = this.ctx.measureText(text.text);

        const width = metrics.width;
        const height = text.fontSize;

        // Calculate center of the text
        const centerX = text.x + width / 2;
        const centerY = text.y - height / 2;

        // Move origin to the text center
        this.ctx.translate(centerX, centerY);

        // Rotate around center
        this.ctx.rotate(text.rotation * Math.PI / 180);

        // Draw text relative to center
        this.ctx.fillText(
            text.text,
            -width / 2,
            height / 2
        );

        if (text.id === selectedTextId) {

            this.ctx.strokeStyle = '#2196F3';
            this.ctx.lineWidth = 2;

            // Selection rectangle
            this.ctx.strokeRect(
                -width / 2 - 4,
                -height / 2,
                width + 8,
                height + 6
            );

            // Resize handle
            const handleSize = 10;

            this.ctx.fillStyle = '#2196F3';

            this.ctx.fillRect(
                width / 2 + 2,
                height / 2,
                handleSize,
                handleSize
            );

            // Rotation handle
            const rotateHandleY = -height / 2 - 20;

            // Connector line
            this.ctx.beginPath();

            this.ctx.moveTo(
                0,
                -height / 2
            );

            this.ctx.lineTo(
                0,
                rotateHandleY
            );

            this.ctx.stroke();

            // Rotation circle
            this.ctx.beginPath();

            this.ctx.arc(
                0,
                rotateHandleY,
                6,
                0,
                Math.PI * 2
            );

            this.ctx.fill();
        }

        this.ctx.restore();
    }

}
}
