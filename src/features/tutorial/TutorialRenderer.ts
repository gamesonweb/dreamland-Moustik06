import {AdvancedDynamicTexture, Button, Control, Rectangle, TextBlock} from "@babylonjs/gui";
import {TutorialHighlight, TutorialStepData} from "./TutorialSteps.ts";
import {AbstractMesh, Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3,Animation} from "@babylonjs/core";

export class TutorialRenderer {
    private scene: Scene;
    // @ts-ignore
    private advancedTexture: AdvancedDynamicTexture;
    private currentOverlay?: Rectangle;
    private highlights: Map<string, AbstractMesh> = new Map();
    private numberLabels: Mesh[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public async initialize(): Promise<void> {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("TutorialUI");
    }

    public showStepUI(stepData: TutorialStepData): void {
        if (this.currentOverlay) {
            this.advancedTexture.removeControl(this.currentOverlay);
        }

        const panel = new Rectangle("tutorialPanel");
        panel.width = "700px";
        panel.height = "250px";
        panel.background = "rgba(0, 0, 0, 0.9)";
        panel.color = "#FFD700";
        panel.thickness = 3;
        panel.cornerRadius = 25;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "80px";

        const title = new TextBlock("tutorialTitle");
        title.text = "🎹 " + stepData.title + " 🎹";
        title.color = "#FFD700";
        title.fontSize = 32;
        title.fontWeight = "bold";
        title.top = "-60px";
        title.height = "40px";
        panel.addControl(title);

        const message = new TextBlock("tutorialMessage");
        message.text = stepData.message;
        message.color = "white";
        message.fontSize = 22;
        message.textWrapping = true;
        message.lineSpacing = "8px";
        message.height = "100px";
        message.top = "0px";
        panel.addControl(message);

        if (stepData.action?.type === 'click_note' && stepData.action.number) {
            const progress = new TextBlock("progress");
            progress.text = `Note ${stepData.action.number} / 3`;
            progress.color = "#00FF00";
            progress.fontSize = 18;
            progress.top = "60px";
            progress.height = "20px";
            panel.addControl(progress);
        }

        if (stepData.action?.type === 'click_continue') {
            const continueButton = Button.CreateSimpleButton("continueButton", "Continuer");
            continueButton.width = "150px";
            continueButton.height = "45px";
            continueButton.color = "black";
            continueButton.background = "#FFD700";
            continueButton.top = "90px";
            continueButton.fontSize = 20;
            continueButton.fontWeight = "bold";
            continueButton.cornerRadius = 10;
            continueButton.onPointerClickObservable.add(() => {
                const event = new CustomEvent('TUTORIAL_CONTINUE');
                document.dispatchEvent(event);
            });
            panel.addControl(continueButton);
        }

        this.advancedTexture.addControl(panel);
        this.currentOverlay = panel;
    }

    public addHighlight(highlight: TutorialHighlight): void {
        switch (highlight.type) {
            case 'key':
                this.highlightKey(highlight.target, highlight.pulse, {
                    number: highlight.number,
                    showNumbers: highlight.showNumbers
                });
                break;
        }
    }

    private highlightKey(note: string | string[], pulse: boolean = false, options: any = {}): void {
        const notes = Array.isArray(note) ? note : [note];

        notes.forEach((n, index) => {
            const keyMesh = this.scene.getMeshByName(`key_${n}`);
            if (!keyMesh) return;

            const highlight = MeshBuilder.CreateBox(
                `highlight_${n}`,
                { width: 0.5, height: 0.1, depth: 1.6 },
                this.scene
            );
            highlight.isPickable = false;
            highlight.position = keyMesh.position.clone();
            highlight.position.y += 0.1;

            const material = new StandardMaterial(`highlightMat_${n}`, this.scene);

            if (options.showNumbers) {
                const colors = [
                    new Color3(1, 0, 0), // Rouge pour 1
                    new Color3(0, 1, 0), // Vert pour 2
                    new Color3(0, 0, 1)  // Bleu pour 3
                ];
                material.emissiveColor = colors[index] || new Color3(1, 1, 0);
            } else if (options.number) {
                const colors = [
                    new Color3(1, 0, 0), // Rouge pour 1
                    new Color3(0, 1, 0), // Vert pour 2
                    new Color3(0, 0, 1)  // Bleu pour 3
                ];
                material.emissiveColor = colors[options.number - 1] || new Color3(1, 1, 0);
            } else {
                material.emissiveColor = new Color3(1, 1, 0); // Jaune par défaut
            }

            material.alpha = 0.5;
            highlight.material = material;


            if (pulse) {
                const animation = new Animation(
                    `highlightPulse_${n}`,
                    "material.alpha",
                    30,
                    Animation.ANIMATIONTYPE_FLOAT,
                    Animation.ANIMATIONLOOPMODE_CYCLE
                );

                animation.setKeys([
                    { frame: 0, value: 0.2 },
                    { frame: 15, value: 0.9 },
                    { frame: 30, value: 0.2 }
                ]);

                highlight.animations = [animation];
                this.scene.beginAnimation(highlight, 0, 30, true);

                const scaleAnimation = new Animation(
                    `highlightScale_${n}`,
                    "scaling",
                    30,
                    Animation.ANIMATIONTYPE_VECTOR3,
                    Animation.ANIMATIONLOOPMODE_CYCLE
                );

                scaleAnimation.setKeys([
                    { frame: 0, value: new Vector3(1, 1, 1) },
                    { frame: 15, value: new Vector3(1.2, 1.5, 1.2) },
                    { frame: 30, value: new Vector3(1, 1, 1) }
                ]);

                highlight.animations.push(scaleAnimation);
                this.scene.beginAnimation(highlight, 0, 30, true);
            }

            this.highlights.set(n, highlight);
        });
    }

    public clearAllHighlights(): void {
        this.highlights.forEach((mesh) => {
            mesh.dispose();
        });
        this.highlights.clear();

        this.numberLabels.forEach(label => label.dispose());
        this.numberLabels = [];
    }

    public showCompletionMessage(): void {
        setTimeout(() => {
            this.currentOverlay?.dispose();
        }, 3000);
    }
}