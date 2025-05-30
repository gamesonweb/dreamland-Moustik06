import * as BABYLON from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';

export class PlayerManager {
    private scene: BABYLON.Scene;
    private camera: BABYLON.UniversalCamera;
    private canvas: HTMLCanvasElement;
    private playerBody: BABYLON.Mesh;
    private physicsAggregate: BABYLON.PhysicsAggregate;

    // Contrôles
    private inputMap: { [key: string]: boolean } = {};
    private moveSpeed: number = 12;
    private acceleration: number = 20;
    private deceleration: number = 10;
    private jumpForce: number = 10;
    private isGrounded: boolean = false;
    private keyboardLayout: 'qwerty' | 'azerty' = 'qwerty';
    private currentVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private groundCheckTimer: number = 0;
    private groundCheckInterval: number = 0.1;

    private keydownHandler: (event: KeyboardEvent) => void;
    private keyupHandler: (event: KeyboardEvent) => void;

    constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.canvas = canvas;

        this.keydownHandler = () => {
        };
        this.keyupHandler = () => {
        };

    }

    public async initialize(): Promise<void> {
        this.createPhysicalPlayer();
        this.setupControls();
    }

    private createPhysicalPlayer(): void {
        const startPosition = new BABYLON.Vector3(6, 12, 58);

        this.playerBody = BABYLON.MeshBuilder.CreateCapsule("playerBody", {
            radius: 0.5,
            height: 2.5,
            tessellation: 16,
            subdivisions: 1
        }, this.scene);

        this.playerBody.position = startPosition;
        this.playerBody.isVisible = true;

        this.physicsAggregate = new BABYLON.PhysicsAggregate(
            this.playerBody,
            BABYLON.PhysicsShapeType.CAPSULE,
            { mass: 70, restitution: 0.1, friction: 0.8 },
            this.scene
        );

        if (this.physicsAggregate.body) {
            this.physicsAggregate.body.setMassProperties({ inertia: new BABYLON.Vector3(0, 0, 0) });
            this.physicsAggregate.body.setAngularVelocity(BABYLON.Vector3.Zero());
            this.physicsAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            this.physicsAggregate.body.setGravityFactor(1.5);
        }

        this.camera = new BABYLON.UniversalCamera("playerCamera", startPosition, this.scene);
        this.camera.attachControl(this.canvas, true);
        this.camera.inertia = 0.5;
        this.camera.angularSensibility = 2000;

        this.detectKeyboardLayout();

        this.scene.registerBeforeRender(() => {
            this.handlePhysicsMovement();
        });
    }

    private detectKeyboardLayout(): void {
        this.keyboardLayout = 'qwerty';
    }

    private handlePhysicsMovement(): void {
        if (!this.physicsAggregate.body) return;

        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        this.groundCheckTimer += deltaTime;
        if (this.groundCheckTimer >= this.groundCheckInterval) {
            this.checkGrounded();
            this.groundCheckTimer = 0;
        }

        const forward = this.camera.getFrontPosition(1).subtract(this.camera.position);
        forward.y = 0;
        forward.normalize();

        const right = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up());
        right.normalize();

        let targetVelocity = BABYLON.Vector3.Zero();
        const currentSpeed = this.inputMap['shift'] ? this.moveSpeed * 1.5 : this.moveSpeed;

        if (this.keyboardLayout === 'azerty') {
            if (this.inputMap['z']) targetVelocity.addInPlace(forward.scale(currentSpeed));
            if (this.inputMap['s']) targetVelocity.addInPlace(forward.scale(-currentSpeed));
            if (this.inputMap['q']) targetVelocity.addInPlace(right.scale(-currentSpeed));
            if (this.inputMap['d']) targetVelocity.addInPlace(right.scale(currentSpeed));
        } else {
            if (this.inputMap['w']) targetVelocity.addInPlace(forward.scale(currentSpeed));
            if (this.inputMap['s']) targetVelocity.addInPlace(forward.scale(-currentSpeed));
            if (this.inputMap['a']) targetVelocity.addInPlace(right.scale(-currentSpeed));
            if (this.inputMap['d']) targetVelocity.addInPlace(right.scale(currentSpeed));
        }

        if (targetVelocity.length() > currentSpeed) {
            targetVelocity.normalize().scaleInPlace(currentSpeed);
        }

        const acc = targetVelocity.length() > 0 ? this.acceleration : this.deceleration;
        this.currentVelocity.x = BABYLON.Scalar.Lerp(this.currentVelocity.x, targetVelocity.x, acc * deltaTime);
        this.currentVelocity.z = BABYLON.Scalar.Lerp(this.currentVelocity.z, targetVelocity.z, acc * deltaTime);

        const currentPhysicsVelocity = this.physicsAggregate.body.getLinearVelocity();

        this.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(
            this.currentVelocity.x,
            currentPhysicsVelocity.y,
            this.currentVelocity.z
        ));

        this.camera.position = this.playerBody.position.clone();
        this.camera.position.y += 1.2;

        if (this.inputMap[' '] && this.isGrounded) {
            this.physicsAggregate.body.applyImpulse(
                new BABYLON.Vector3(0, this.jumpForce * 70, 0),
                this.playerBody.position
            );
        }
    }

    private checkGrounded(): void {
        const rayOrigin = this.playerBody.position.clone();
        rayOrigin.y -= 1.2;

        const ray = new BABYLON.Ray(rayOrigin, new BABYLON.Vector3(0, -1, 0), 0.6);

        const hit = this.scene.pickWithRay(ray, (mesh) => {
            return mesh !== this.playerBody && mesh.physicsBody !== undefined;
        });

        this.isGrounded = hit?.hit || false;

        if (!this.isGrounded && this.physicsAggregate.body) {
            const velocity = this.physicsAggregate.body.getLinearVelocity();
            if (velocity.y < -20) {
                this.physicsAggregate.body.setLinearVelocity(
                    new BABYLON.Vector3(velocity.x, -20, velocity.z)
                );
            }
        }
    }


    private setupControls(): void {
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);

        this.keydownHandler = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            this.inputMap[key] = true;

            if (event.key === 'Shift') {
                this.inputMap['shift'] = true;
            }

            if (event.key === 'Escape') {
                document.exitPointerLock();
            }
            if (event.key === 'F2') {
                Inspector.Show(this.scene, {});
            }
            if (event.key === 'F1') {
                event.preventDefault();
                this.toggleKeyboardLayout();
            }
        };

        this.keyupHandler = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            this.inputMap[key] = false;

            if (event.key === 'Shift') {
                this.inputMap['shift'] = false;
            }
        };

        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);


    }

    private toggleKeyboardLayout(): void {
        this.keyboardLayout = this.keyboardLayout === 'qwerty' ? 'azerty' : 'qwerty';

    }

    public setupWorldPhysics(worldMesh: BABYLON.AbstractMesh): void {
        worldMesh.getChildMeshes().forEach(childMesh => {
            if (!(childMesh instanceof BABYLON.Mesh)) return;

            const meshName = childMesh.name.toLowerCase();

            if (meshName.includes("grass") || meshName.includes("decoration") || meshName.includes("light")) {
                console.log(`Skipped non-collidable: ${childMesh.name}`);
                return;
            }

            if (meshName.includes("wall") ||
                meshName.includes("collision") ||
                meshName.includes("invisible")) {

                childMesh.isVisible = false;
                this.createStaticPhysics(childMesh, BABYLON.PhysicsShapeType.CONVEX_HULL);
                console.log(`Made invisible physics wall: ${childMesh.name}`);
                return;
            }

            this.createStaticPhysics(childMesh, BABYLON.PhysicsShapeType.CONVEX_HULL);
            console.log(`Created precise mesh physics for: ${childMesh.name}`);
        });
    }

    private createStaticPhysics(mesh: BABYLON.Mesh, shapeType: BABYLON.PhysicsShapeType): void {
        try {
            const aggregate = new BABYLON.PhysicsAggregate(
                mesh,
                shapeType,
                {
                    mass: 0,
                    restitution: 0.2,
                    friction: 0.8
                },
                this.scene
            );

            if (shapeType === BABYLON.PhysicsShapeType.MESH && aggregate.shape) {
                console.log(`Mesh physics created successfully for: ${mesh.name}`);
            }
        } catch (error) {
            console.error(`Failed to create physics for ${mesh.name}:`, error);
            if (shapeType === BABYLON.PhysicsShapeType.MESH) {
                console.log(`Falling back to convex hull for: ${mesh.name}`);
                this.createStaticPhysics(mesh, BABYLON.PhysicsShapeType.CONVEX_HULL);
            }
        }
    }

}