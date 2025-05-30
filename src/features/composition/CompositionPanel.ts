import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, StackPanel, Control, Rectangle, Button } from '@babylonjs/gui';
import { CompositionModel } from './CompositionModel';
import { EventBus } from '../../core/events/EventBus';
import { showNotification } from '../../core/utils/AnimationUtils';


export class CompositionPanel {
    private scene: BABYLON.Scene;
    private model: CompositionModel;
    private eventBus: EventBus;

    // Éléments UI
    //@ts-ignore
    private eventsContainer: StackPanel;
    private lastDisplayedCount: number = 0;

    constructor(scene: BABYLON.Scene, model: CompositionModel) {
        this.scene = scene;
        this.model = model;
        this.eventBus = EventBus.getInstance();
    }


    public async initialize(): Promise<void> {
        await this.createSequenceInfoPanel();
    }


    private async createSequenceInfoPanel(): Promise<void> {
        const sequencePanel = BABYLON.MeshBuilder.CreatePlane(
            "sequenceInfoPanel",
            { width: 4, height: 2 },
            this.scene
        );
        sequencePanel.position = new BABYLON.Vector3(-11.5, 14.5, -0.5); // En haut à gauche
        sequencePanel.rotation = new BABYLON.Vector3(Math.PI / 6, Math.PI / 2, 0); // Orienté vers la caméra

        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(sequencePanel, 1024, 512);

        const background = new Rectangle();
        background.width = 1;
        background.height = 1;
        background.color = "black";
        background.thickness = 2;
        background.background = "rgba(0, 0, 0, 0.7)";
        background.cornerRadius = 10;
        advancedTexture.addControl(background);

        const title = new TextBlock("sequenceTitle");
        title.text = "COMPOSITION";
        title.color = "white";
        title.fontSize = 28;
        title.fontWeight = "bold";
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.top = "-40%";
        background.addControl(title);

        this.eventsContainer = new StackPanel();
        this.eventsContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.eventsContainer.top = "0%";
        this.eventsContainer.width = 0.9;
        this.eventsContainer.height = "300px";
        this.eventsContainer.isVertical = true;
        background.addControl(this.eventsContainer);


        this.updateDisplay();


        const clearButton = new Button("clearButton");
        clearButton.width = "120px";
        clearButton.height = "30px";
        clearButton.color = "white";
        clearButton.background = "red";
        clearButton.cornerRadius = 5;
        clearButton.thickness = 1;
        clearButton.top = "40%";

        const clearText = new TextBlock("clearText", "Effacer");
        clearText.color = "white";
        clearText.fontSize = 14;
        clearButton.addControl(clearText);

        background.addControl(clearButton);


        clearButton.onPointerClickObservable.add(() => {
            this.model.clear();
            this.updateDisplay();


            showNotification("Composition effacée!", "#ff6666", this.scene);


            this.eventBus.emit('COMPOSITION_CLEARED', {});
        });


        this.scene.onBeforeRenderObservable.add(() => {
            const currentCount = this.model.getEventCount();
            if (currentCount !== this.lastDisplayedCount) {
                this.updateDisplay();
                this.lastDisplayedCount = currentCount;
            }
        });
    }


    private updateDisplay(): void {
        this.eventsContainer.clearControls();

        const events = this.model.getEvents();

        if (events.length === 0) {
            const emptyText = new TextBlock("emptyText");
            emptyText.text = "La séquence est vide. Jouez des notes ou des accords.";
            emptyText.color = "#cccccc";
            emptyText.fontSize = 18;
            emptyText.textWrapping = true;
            emptyText.height = "60px";
            this.eventsContainer.addControl(emptyText);
            return;
        }

        const recentEvents = events.slice(-6);

        recentEvents.forEach((event, index) => {
            const eventText = new TextBlock(`event_${index}`);
            const eventType = event.type === 'chord' ? "Accord" : "Note";
            const notesList = event.notes.join(", ");
            eventText.text = `${index + 1}. ${eventType}: ${notesList}`;
            eventText.color = event.type === 'chord' ? "#ffcc00" : "#66ccff";
            eventText.fontSize = 16;
            eventText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            eventText.height = "30px";
            eventText.textWrapping = true;
            this.eventsContainer.addControl(eventText);
        });

        if (events.length > 6) {
            const moreText = new TextBlock("moreText");
            moreText.text = `... et ${events.length - 6} événements supplémentaires`;
            moreText.color = "#999999";
            moreText.fontSize = 14;
            moreText.height = "20px";
            moreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.eventsContainer.addControl(moreText);
        }
    }
}