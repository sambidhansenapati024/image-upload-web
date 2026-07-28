import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ImageResponse } from '../modal/image-response';
import { Dialog, DialogModule } from "primeng/dialog";
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { EditorState } from '../modal/editor-state';
import { CanvasService } from './services/canvas.service';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { ImageUploadServiceService } from '../../service/image-upload-service.service';
import { HistoryService } from './services/history.service';
import { InputTextModule } from 'primeng/inputtext';
import { TextElement } from '../modal/text-element';
import { SelectModule } from 'primeng/select';
import { ShapeElement } from '../modal/shape-element';
import { RadioButton } from 'primeng/radiobutton';

@Component({
    selector: 'app-image-editor',
    imports: [CommonModule,
        DialogModule,
        ButtonModule,
        PanelMenuModule,
        SliderModule,
        FormsModule, InputTextModule, SelectModule, RadioButton],
    templateUrl: './image-editor.component.html',
    styleUrl: './image-editor.component.css'
})
export class ImageEditorComponent implements AfterViewInit, OnChanges {

    isDraggingCrop = false;
    private sliderHistorySaved = false;
    textInput = '';

    dragStartX = 0;
    dragStartY = 0;
    private colorHistorySaved = false;
    private nextShapeId = 1;

    cropStartX = 0;
    cropStartY = 0;

    isDraggingText = false;
    isResizingText = false;

    isResizingShape = false;
    isRotatingShape = false;
    selectedShapeFillColor = '#2196F3';
    selectedShapeStrokeColor = '#2196F3';
    showSaveDialog = false;

    saveMode: 'COPY' | 'REPLACE' = 'COPY';

    shapeResizeStartX = 0;
    shapeResizeStartY = 0;

    startShapeWidth = 0;
    startShapeHeight = 0;

    shapeRotationStartAngle = 0;
    startShapeRotation = 0;

    isRotatingText = false;

    textRotationStartAngle = 0;

    startRotation = 0;

    textResizeStartY = 0;

    startFontSize = 0;

    selectedTextId: number | null = null;

    selectedShapeId: number | null = null;

    textDragOffsetX = 0;

    textDragOffsetY = 0;

    isResizing = false;

    resizeDirection: 'bottom-right' | null = null;

    startWidth = 0;
    startHeight = 0;

    isDraggingShape = false;

    shapeDragOffsetX = 0;

    shapeDragOffsetY = 0;

    fontFamilies: string[] = [
        'Arial',
        'Verdana',
        'Times New Roman',
        'Georgia',
        'Courier New',
        'Tahoma'
    ];

    tools: MenuItem[] = [
        {
            label: 'Transform',
            icon: 'pi pi-images',
            expanded: true,
            items: [
                {
                    label: 'Rotate',
                    icon: 'pi pi-refresh',
                    command: () => this.rotate()
                },
                {
                    label: 'Flip Horizontal',
                    icon: 'pi pi-arrow-right-arrow-left',
                    command: () => this.flipHorizontal()
                },
                {
                    label: 'Flip Vertical',
                    icon: 'pi pi-arrow-up-arrow-down',
                    command: () => this.flipVertical()
                },
                {
                    label: 'Zoom In',
                    icon: 'pi pi-search-plus',
                    command: () => this.zoomIn()
                },
                {
                    label: 'Zoom Out',
                    icon: 'pi pi-search-minus',
                    command: () => this.zoomOut()
                },
                {
                    label: 'Resize',
                    icon: 'pi pi-expand',
                    command: () => this.resize()
                },
                {
                    label: 'Crop',
                    icon: 'pi pi-crop',
                    command: () => this.crop()
                }
            ]
        },
        {
            label: 'Adjust',
            icon: 'pi pi-sliders-h',
            items: [
                {
                    label: 'Brightness',
                    icon: 'pi pi-sun',
                    command: () => this.showBrightness()
                },
                {
                    label: 'Contrast',
                    icon: 'pi pi-circle',
                    command: () => this.showContrast()
                },
                {
                    label: 'Saturation',
                    icon: 'pi pi-palette',
                    command: () => this.showSaturation()
                }
            ]
        },
        {
            label: 'Filters',
            icon: 'pi pi-sparkles',
            command: () => this.showFilters()
        },
        {
            label: 'Text',
            icon: 'pi pi-pencil',
            command: () => this.showText()
        },
        {
            label: 'Shapes',
            icon: 'pi pi-stop',
            items: [
                {
                    label: 'Rectangle',
                    icon: 'pi pi-square',
                    command: () => {

                        this.activeTool = 'shapes';

                        this.addRectangle();

                    }
                }
            ]
        }
    ];

    @ViewChild('editorCanvas')
    canvas!: ElementRef<HTMLCanvasElement>;

    activeTool: string | null = null;


    editorState: EditorState = {

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

    viewportState = {

        zoom: 1,

        panX: 0,

        panY: 0

    };

    cropMode = false;

    cropArea = {
        x: 100,
        y: 100,
        width: 200,
        height: 200
    };

    @Input() visible = false;

    @Input() image!: ImageResponse;

    @Output() visibleChange = new EventEmitter<boolean>();

    @Output() saved = new EventEmitter<void>();

    constructor(

        private canvasService: CanvasService,
        private imageUploadService: ImageUploadServiceService,
        private historyService: HistoryService

    ) { }


    async ngOnChanges() {

        if (this.visible && this.image) {

            this.historyService.clear();

            await this.canvasService.loadImage(this.image.imageUrl);

            this.canvasService.render(
                this.editorState,
                this.viewportState,
                this.selectedTextId
            );

        }

    }

    updateBrightness() {

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }
    startCropDrag(event: MouseEvent) {

        if (this.isResizing) {
            return;
        }

        this.isDraggingCrop = true;

        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;

        this.cropStartX = this.cropArea.x;
        this.cropStartY = this.cropArea.y;



        event.preventDefault();
    }

    updateContrast() {

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    updateSaturation() {

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    startResize(
        event: MouseEvent,
        direction: 'bottom-right'
    ) {

        event.stopPropagation();

        this.isResizing = true;

        this.resizeDirection = direction;

        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;

        this.startWidth = this.cropArea.width;
        this.startHeight = this.cropArea.height;

    }

    resizeCrop(event: MouseEvent) {

        if (!this.isResizing) {
            return;
        }

        const dx = event.clientX - this.dragStartX;
        const dy = event.clientY - this.dragStartY;

        const canvas = this.canvas.nativeElement;

        this.cropArea.width = Math.max(
            50,
            Math.min(
                this.startWidth + dx,
                canvas.width - this.cropArea.x
            )
        );

        this.cropArea.height = Math.max(
            50,
            Math.min(
                this.startHeight + dy,
                canvas.height - this.cropArea.y
            )
        );

    }
    moveCrop(event: MouseEvent) {

        const canvas = this.canvas.nativeElement;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        if (
            this.isRotatingText &&
            this.selectedText
        ) {

            const ctx = this.canvas.nativeElement.getContext('2d');

            if (!ctx) {
                return;
            }

            ctx.font =
                `${this.selectedText.bold ? 'bold ' : ''}${this.selectedText.fontSize}px ${this.selectedText.fontFamily}`;

            const width = ctx.measureText(this.selectedText.text).width;
            const height = this.selectedText.fontSize;

            const centerX = this.selectedText.x + width / 2;
            const centerY = this.selectedText.y - height / 2;

            const currentAngle = Math.atan2(
                y - centerY,
                x - centerX
            );

            let rotation =
                this.startRotation +
                (
                    currentAngle -
                    this.textRotationStartAngle
                ) * 180 / Math.PI;

            // Hold Shift to snap to 15° increments
            if (event.shiftKey) {
                rotation = Math.round(rotation / 15) * 15;
            }
            this.selectedText.rotation = rotation;
            this.refreshCanvas();

            return;
        }

        if (this.isRotatingShape) {

            const shape = this.editorState.shapeElements.find(
                s => s.id === this.selectedShapeId
            );

            if (shape) {

                const centerX = shape.x + shape.width / 2;
                const centerY = shape.y + shape.height / 2;

                const currentAngle = Math.atan2(
                    y - centerY,
                    x - centerX
                );

                const deltaAngle = currentAngle - this.shapeRotationStartAngle;

                shape.rotation =
                    this.startShapeRotation +
                    (deltaAngle * 180 / Math.PI);

                this.refreshCanvas();
            }

            return;
        }

        if (this.isResizingShape) {

            const shape = this.editorState.shapeElements.find(
                s => s.id === this.selectedShapeId
            );

            if (shape) {

                const dx = x - this.shapeResizeStartX;
                const dy = y - this.shapeResizeStartY;

                shape.width = Math.max(20, this.startShapeWidth + dx);
                shape.height = Math.max(20, this.startShapeHeight + dy);

                this.refreshCanvas();

            }

            return;

        }

        if (this.isDraggingShape) {

            this.moveShape(x, y);

            return;

        }

        if (this.isDraggingText) {

            this.moveText(event);

            return;

        }

        if (this.isResizing) {

            this.resizeCrop(event);

            return;

        }

        if (!this.isDraggingCrop) {
            return;
        }

        const dx = event.clientX - this.dragStartX;
        const dy = event.clientY - this.dragStartY;

        let newX = this.cropStartX + dx;
        let newY = this.cropStartY + dy;

        // Prevent moving outside the canvas
        newX = Math.max(
            0,
            Math.min(newX, canvas.width - this.cropArea.width)
        );

        newY = Math.max(
            0,
            Math.min(newY, canvas.height - this.cropArea.height)
        );

        this.cropArea.x = newX;
        this.cropArea.y = newY;
    }

    stopCropDrag() {

        this.isDraggingCrop = false;

        this.isResizing = false;

        this.resizeDirection = null;

        this.stopTextDrag();

    }

    resetEditor() {

        this.editorState = {

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

        this.cropMode = false;

        this.activeTool = null;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }
    applyCrop() {

        this.saveHistory();

        this.editorState.crop = {

            ...this.cropArea

        };

        this.cropMode = false;

        this.activeTool = null;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    cancelCrop() {

        this.cropMode = false;

        this.activeTool = null;

    }

    ngAfterViewInit(): void {

        this.canvasService.initialize(
            this.canvas.nativeElement
        );

    }

    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    save() {

        this.showSaveDialog = true;

    }

    confirmSave(): void {

        const canvas = this.canvas.nativeElement;

        canvas.toBlob((blob: Blob | null) => {

            if (!blob) {
                return;
            }

            const formData = new FormData();

            formData.append(
                'file',
                blob,
                'edited-image.png'
            );

            if (this.saveMode === 'REPLACE') {

                this.imageUploadService
                    .replaceImage(this.image.id, formData)
                    .subscribe({

                        next: (response) => {

                            console.log('Image replaced', response);

                            this.saved.emit();

                            this.close();

                        },

                        error: (err) => {

                            console.error(err);

                        }

                    });

            }

            if (this.saveMode === 'COPY') {

                this.imageUploadService
                    .copyImage(this.image.id, formData)
                    .subscribe({

                        next: (response) => {

                            console.log('Image copied', response);

                            this.saved.emit();

                            this.close();

                        },

                        error: (err) => {

                            console.error(err);

                        }

                    });

            }

        }, 'image/png');

        this.showSaveDialog = false;

    }

    rotate() {

        this.saveHistory();

        this.editorState.rotation += 90;

        if (this.editorState.rotation >= 360) {

            this.editorState.rotation = 0;

        }

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    flipHorizontal() {
        this.saveHistory();

        this.editorState.flipX = !this.editorState.flipX;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    flipVertical() {

        this.saveHistory();

        this.editorState.flipY = !this.editorState.flipY;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    zoomIn() {
        this.saveHistory();
        this.viewportState.zoom += 0.1;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    zoomOut() {

        this.saveHistory();

        if (this.viewportState.zoom <= 0.2) {

            return;

        }

        this.viewportState.zoom -= 0.1;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    resize() {
        this.activeTool = 'resize';
    }

    crop() {
        this.saveHistory();

        this.activeTool = 'crop';

        this.cropMode = true;

    }

    showBrightness() {

        this.activeTool = 'brightness';

    }

    showContrast() {
        this.activeTool = 'contrast';
    }

    showSaturation() {
        this.activeTool = 'saturation';
    }

    showFilters() {

        this.activeTool = 'filters';

    }
    showText(): void {

        this.activeTool = 'text';

    }

    applyFilter(filter: 'none' | 'grayscale' | 'sepia'): void {

        this.saveHistory();

        this.editorState.filter = filter;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    undo() {

        const snapshot = this.historyService.undo(
            this.editorState,
            this.viewportState
        );

        if (!snapshot) {
            return;
        }

        this.editorState = snapshot.editorState;

        this.viewportState = snapshot.viewportState;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    redo() {

        const snapshot = this.historyService.redo(
            this.editorState,
            this.viewportState
        );

        if (!snapshot) {
            return;
        }

        this.editorState = snapshot.editorState;

        this.viewportState = snapshot.viewportState;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    private saveHistory(): void {

        this.historyService.push(
            this.editorState,
            this.viewportState
        );

    }

    startSliderEdit(): void {

        if (this.sliderHistorySaved) {
            return;
        }

        this.saveHistory();

        this.sliderHistorySaved = true;

    }

    endSliderEdit(): void {

        this.sliderHistorySaved = false;

    }

    addText(): void {

        if (!this.textInput.trim()) {
            return;
        }

        this.saveHistory();

        this.editorState.textElements.push({

            id: Date.now(),

            text: this.textInput,

            x: 100,

            y: 100,

            fontSize: 32,

            color: '#ffffff',

            fontFamily: 'Arial',

            bold: false,
            rotation: 0,

            selected: false

        });

        this.textInput = '';

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    private findTextAtPosition(
        x: number,
        y: number
    ): TextElement | null {

        const ctx = this.canvas.nativeElement.getContext('2d');

        if (!ctx) {
            return null;
        }

        for (let i = this.editorState.textElements.length - 1; i >= 0; i--) {

            const text = this.editorState.textElements[i];

            ctx.font =
                `${text.bold ? 'bold ' : ''}${text.fontSize}px ${text.fontFamily}`;

            const width = ctx.measureText(text.text).width;
            const height = text.fontSize;

            const centerX = text.x + width / 2;
            const centerY = text.y - height / 2;

            // Convert mouse position into the text's local coordinate system
            const dx = x - centerX;
            const dy = y - centerY;

            const angle = -text.rotation * Math.PI / 180;

            const localX =
                dx * Math.cos(angle) - dy * Math.sin(angle);

            const localY =
                dx * Math.sin(angle) + dy * Math.cos(angle);

            if (
                localX >= -width / 2 &&
                localX <= width / 2 &&
                localY >= -height / 2 &&
                localY <= height / 2
            ) {
                return text;
            }

        }

        return null;

    }

    startTextDrag(event: MouseEvent): void {

        const canvas = this.canvas.nativeElement;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        const resizeText = this.findResizeHandleAtPosition(x, y);

        const rotateText = this.findRotationHandleAtPosition(x, y);

        if (rotateText) {

            this.saveHistory();

            this.selectedTextId = rotateText.id;

            this.isRotatingText = true;

            const centerX = rotateText.x;
            const centerY = rotateText.y;

            this.textRotationStartAngle = Math.atan2(
                y - centerY,
                x - centerX
            );

            this.startRotation = rotateText.rotation;

            return;

        }

        if (resizeText) {

            this.saveHistory();

            this.isResizingText = true;

            this.selectedTextId = resizeText.id;

            this.textResizeStartY = y;

            this.startFontSize = resizeText.fontSize;

            return;

        }
        const text = this.findTextAtPosition(x, y);

        if (!text) {
            return;
        }
        this.saveHistory();

        this.isDraggingText = true;

        this.selectedTextId = text.id;

        this.textDragOffsetX = x - text.x;

        this.textDragOffsetY = y - text.y;

    }

    moveText(event: MouseEvent): void {

        if (!this.isDraggingText || this.selectedTextId === null) {
            return;
        }

        const canvas = this.canvas.nativeElement;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const text = this.editorState.textElements.find(
            t => t.id === this.selectedTextId
        );

        if (!text) {
            return;
        }

        text.x = x - this.textDragOffsetX;

        text.y = y - this.textDragOffsetY;

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId
        );

    }

    stopTextDrag(): void {

        this.isDraggingText = false;

        this.isDraggingShape = false;

        this.isResizingShape = false;

        this.isRotatingShape = false;

    }

    get selectedText(): TextElement | undefined {

        return this.editorState.textElements.find(
            text => text.id === this.selectedTextId
        );

    }

    refreshCanvas(): void {

        this.canvasService.render(
            this.editorState,
            this.viewportState,
            this.selectedTextId,
            this.selectedShapeId
        );

    }

    startColorEdit(): void {

        if (this.colorHistorySaved) {
            return;
        }

        this.saveHistory();

        this.colorHistorySaved = true;

    }

    endColorEdit(): void {

        this.colorHistorySaved = false;

    }

    toggleBold(): void {

        if (!this.selectedText) {
            return;
        }

        this.saveHistory();

        this.selectedText.bold = !this.selectedText.bold;

        this.refreshCanvas();

    }

    deleteSelectedText(): void {

        if (!this.selectedText) {
            return;
        }

        this.saveHistory();

        this.editorState.textElements =
            this.editorState.textElements.filter(
                text => text.id !== this.selectedTextId
            );

        this.selectedTextId = null;

        this.refreshCanvas();

    }

    changeFontFamily(): void {

        if (!this.selectedText) {
            return;
        }

        this.saveHistory();

        this.refreshCanvas();

    }

    private findResizeHandleAtPosition(
        x: number,
        y: number
    ): TextElement | null {

        const ctx = this.canvas.nativeElement.getContext('2d');

        if (!ctx) {
            return null;
        }

        for (let i = this.editorState.textElements.length - 1; i >= 0; i--) {

            const text = this.editorState.textElements[i];

            ctx.font =
                `${text.bold ? 'bold ' : ''}${text.fontSize}px ${text.fontFamily}`;

            const width = ctx.measureText(text.text).width;
            const height = text.fontSize;

            const centerX = text.x + width / 2;
            const centerY = text.y - height / 2;

            // Convert mouse into local coordinates
            const dx = x - centerX;
            const dy = y - centerY;

            const angle = -text.rotation * Math.PI / 180;

            const localX =
                dx * Math.cos(angle) - dy * Math.sin(angle);

            const localY =
                dx * Math.sin(angle) + dy * Math.cos(angle);

            const handleSize = 10;

            if (
                localX >= width / 2 + 2 &&
                localX <= width / 2 + 2 + handleSize &&
                localY >= height / 2 &&
                localY <= height / 2 + handleSize
            ) {
                return text;
            }

        }

        return null;

    }

    private findRotationHandleAtPosition(
        x: number,
        y: number
    ): TextElement | null {

        const ctx = this.canvas.nativeElement.getContext('2d');

        if (!ctx) {
            return null;
        }

        for (let i = this.editorState.textElements.length - 1; i >= 0; i--) {

            const text = this.editorState.textElements[i];

            ctx.font =
                `${text.bold ? 'bold ' : ''}${text.fontSize}px ${text.fontFamily}`;

            const width = ctx.measureText(text.text).width;
            const height = text.fontSize;

            const centerX = text.x + width / 2;
            const centerY = text.y - height / 2;

            // Convert mouse position to the text's local coordinates
            const dx = x - centerX;
            const dy = y - centerY;

            const angle = -text.rotation * Math.PI / 180;

            const localX =
                dx * Math.cos(angle) - dy * Math.sin(angle);

            const localY =
                dx * Math.sin(angle) + dy * Math.cos(angle);

            const rotateHandleY = -height / 2 - 20;

            const distance = Math.sqrt(
                Math.pow(localX, 2) +
                Math.pow(localY - rotateHandleY, 2)
            );

            if (distance <= 8) {
                return text;
            }

        }

        return null;
    }

    addRectangle(): void {

        this.saveHistory();

        this.editorState.shapeElements.push({

            id: this.nextShapeId++,

            type: 'rectangle',

            x: 100,

            y: 100,

            width: 180,

            height: 120,

            fillColor: 'transparent',

            strokeColor: '#2196F3',

            strokeWidth: 2,

            rotation: 0,

            selected: false

        });

        this.refreshCanvas();

    }

    private findShapeAtPosition(
        x: number,
        y: number
    ): ShapeElement | null {

        for (let i = this.editorState.shapeElements.length - 1; i >= 0; i--) {

            const shape = this.editorState.shapeElements[i];

            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            const angle = -shape.rotation * Math.PI / 180;

            const localX =
                dx * Math.cos(angle) -
                dy * Math.sin(angle);

            const localY =
                dx * Math.sin(angle) +
                dy * Math.cos(angle);

            if (
                localX >= -shape.width / 2 &&
                localX <= shape.width / 2 &&
                localY >= -shape.height / 2 &&
                localY <= shape.height / 2
            ) {
                return shape;
            }

        }

        return null;

    }

    private startShapeDrag(
        x: number,
        y: number
    ): boolean {

        const shape = this.findShapeAtPosition(x, y);

        if (!shape) {
            return false;
        }

        this.saveHistory();

        this.selectedShapeId = shape.id;
        this.selectedShapeFillColor = shape.fillColor;
        this.selectedShapeStrokeColor = shape.strokeColor;

        this.isDraggingShape = true;

        this.shapeDragOffsetX = x - shape.x;
        this.shapeDragOffsetY = y - shape.y;

        this.refreshCanvas();

        return true;

    }

    private moveShape(
        x: number,
        y: number
    ): void {

        const shape = this.editorState.shapeElements.find(
            s => s.id === this.selectedShapeId
        );

        if (!shape) {
            return;
        }

        shape.x = x - this.shapeDragOffsetX;
        shape.y = y - this.shapeDragOffsetY;

        this.refreshCanvas();
    }

    startCanvasInteraction(event: MouseEvent): void {

        const canvas = this.canvas.nativeElement;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // 1. Rotation handle
        const rotateShape = this.findShapeRotationHandleAtPosition(x, y);

        if (rotateShape) {

            this.saveHistory();

            this.selectedShapeId = rotateShape.id;

            this.isRotatingShape = true;

            const centerX = rotateShape.x + rotateShape.width / 2;
            const centerY = rotateShape.y + rotateShape.height / 2;

            this.shapeRotationStartAngle = Math.atan2(
                y - centerY,
                x - centerX
            );

            this.startShapeRotation = rotateShape.rotation;

            return;

        }

        // 2. Resize handle
        const resizeShape = this.findShapeResizeHandleAtPosition(x, y);

        if (resizeShape) {

            this.saveHistory();

            this.selectedShapeId = resizeShape.id;

            this.isResizingShape = true;

            this.shapeResizeStartX = x;
            this.shapeResizeStartY = y;

            this.startShapeWidth = resizeShape.width;
            this.startShapeHeight = resizeShape.height;

            return;

        }

        // 3. Drag shape
        if (this.startShapeDrag(x, y)) {
            return;
        }

        // 4. Text
        this.startTextDrag(event);

    }

    private findShapeResizeHandleAtPosition(
        x: number,
        y: number
    ): ShapeElement | null {

        for (let i = this.editorState.shapeElements.length - 1; i >= 0; i--) {

            const shape = this.editorState.shapeElements[i];

            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            const angle = -shape.rotation * Math.PI / 180;

            const localX =
                dx * Math.cos(angle) -
                dy * Math.sin(angle);

            const localY =
                dx * Math.sin(angle) +
                dy * Math.cos(angle);

            const handleSize = 10;

            if (
                localX >= shape.width / 2 + 2 &&
                localX <= shape.width / 2 + 2 + handleSize &&
                localY >= shape.height / 2 + 2 &&
                localY <= shape.height / 2 + 2 + handleSize
            ) {
                return shape;
            }

        }

        return null;

    }

    private findShapeRotationHandleAtPosition(
        x: number,
        y: number
    ): ShapeElement | null {

        for (let i = this.editorState.shapeElements.length - 1; i >= 0; i--) {

            const shape = this.editorState.shapeElements[i];

            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            const angle = -shape.rotation * Math.PI / 180;

            const localX =
                dx * Math.cos(angle) -
                dy * Math.sin(angle);

            const localY =
                dx * Math.sin(angle) +
                dy * Math.cos(angle);

            const rotateHandleY = -shape.height / 2 - 20;

            const distance = Math.sqrt(
                Math.pow(localX, 2) +
                Math.pow(localY - rotateHandleY, 2)
            );

            if (distance <= 8) {
                return shape;
            }

        }

        return null;

    }

    changeShapeFillColor(color: string): void {

        const shape = this.editorState.shapeElements.find(
            s => s.id === this.selectedShapeId
        );

        if (!shape) {
            return;
        }

        this.saveHistory();

        shape.fillColor = color;

        this.selectedShapeFillColor = color;

        this.refreshCanvas();

    }
    changeShapeStrokeColor(color: string): void {

        const shape = this.editorState.shapeElements.find(
            s => s.id === this.selectedShapeId
        );

        if (!shape) {
            return;
        }

        shape.strokeColor = color;

        this.selectedShapeStrokeColor = color;

        this.refreshCanvas();

    }

}
