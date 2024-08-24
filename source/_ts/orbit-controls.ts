import { PerspectiveCamera, Vector2, Vector3 } from "three";

interface OrbitControlsData {
	target: Vector3;
	cameraPosition: Vector3;
}

interface PointerState {
	isMouse: boolean;
    lastFrameLocation: Vector2;
	currentLocation: Vector2;
	startLocation: Vector2;
}

export class OrbitControls {
	public target: Vector3 = new Vector3();
	public camera: PerspectiveCamera;
	public keyboardTranslationSpeed = 0.5; // factor of current distance to target per second.
	public keyboardRotationSpeed = 2.5; // radiants per second
	public pointerRotationSpeed = Math.PI; // radiants per 1 full pointer move across the dom element
	public minimumDistance = 1;
	// poles at 1 and -1 causing gimbal lock
	public minimumVerticalRotation = -0.9;
	public maximumVerticalRotation =  0.9;

	private element: HTMLElement | undefined;
	private savedData: OrbitControlsData | null = null;
	private keysDown: Record<string, boolean> = {};
	private pointersDown: Record<string, PointerState> = {};
	private pinchStartDistance: number | undefined;
	private targetExceptions: EventTarget[] = [];

	constructor(camera: PerspectiveCamera) {
		this.camera = camera;
	}

	/**
	 * Will not process input if the event has the given target.
	 */
	public addTargetException(target: EventTarget) {
		this.targetExceptions.push(target);
	}

	public attachEventHandlers(element: HTMLElement) {
		if (this.element)
			throw 'You have to detach the controller before another element can be attached.';

		element.addEventListener('keydown', e => this.onKeyDown(e));
		element.addEventListener('keyup', e => this.onKeyUp(e));
		element.addEventListener('pointerdown', e => this.onPointerDown(e));
		element.addEventListener('pointerup', e => this.onPointerUp(e));
		element.addEventListener('pointercancel', e => this.onPointerUp(e))
		element.addEventListener('pointermove', e => this.onPointerMove(e));
		element.addEventListener('focusout', e => this.onFocusOut(e));
		element.style.touchAction = 'pan-x pan-y'; // zoom handled by us

		this.element = element;
	}

	public update(deltaTime: number) {
		if (this.keysDown['KeyW']) {
			if (this.keysDown['ShiftLeft']) {
				this.translate(this.up.multiplyScalar(deltaTime * this.keyboardTranslationSpeed * this.distance));
			} else {
				this.zoom(deltaTime * this.keyboardTranslationSpeed);
			}
		}

		if (this.keysDown['KeyA']) {
			this.translate(this.right.multiplyScalar(deltaTime * this.keyboardTranslationSpeed * this.distance));
		}

		if (this.keysDown['KeyS']) {
			if (this.keysDown['ShiftLeft']) {
				this.translate(this.up.multiplyScalar(-deltaTime * this.keyboardTranslationSpeed * this.distance));
			} else {
				this.zoom(-deltaTime * this.keyboardTranslationSpeed);
			}
		}

		if (this.keysDown['KeyD']) {
			this.translate(this.right.multiplyScalar(-deltaTime * this.keyboardTranslationSpeed * this.distance));
		}

		if (this.keysDown['KeyQ']) {
			if (this.keysDown['ShiftLeft']) {
				this.rotateVertically(-deltaTime * this.keyboardRotationSpeed);
			} else {
				this.rotateHorizontally(-deltaTime * this.keyboardRotationSpeed);
			}
		}

		if (this.keysDown["KeyE"]) {
			if (this.keysDown['ShiftLeft']) {
				this.rotateVertically(deltaTime * this.keyboardRotationSpeed);
			} else {
				this.rotateHorizontally(deltaTime * this.keyboardRotationSpeed);
			}
		}

		const entries = Object.values(this.pointersDown);

		// Mouse has a mouse wheel to scroll, touch doesn't. To not interfere with srolling, we ask for 2 fingers on touch to interact with this.
		if ((entries.length == 1 && entries[0].isMouse) || entries.length >= 2) {
			const averageLocationDelta = entries.reduce((acc, entry) => acc.add(entry.currentLocation.clone().sub(entry.lastFrameLocation)), new Vector2(0, 0)).divideScalar(entries.length);

			if (this.keysDown['ShiftLeft'] || entries.length == 3) {
				this.translate(this.clientToWorldSpace(entries[0].lastFrameLocation).sub(this.clientToWorldSpace(entries[0].currentLocation)));
			} else {
				this.rotateHorizontally(-averageLocationDelta.x / this.element!.clientWidth * this.pointerRotationSpeed);
			}
		}

		if (entries.length == 2) {
			const delta0 = entries[0].currentLocation.clone().sub(entries[0].lastFrameLocation);
			const delta1 = entries[1].currentLocation.clone().sub(entries[1].lastFrameLocation);
			const currentDistance = entries[0].currentLocation.distanceTo(entries[1].currentLocation);
			const previousDistance = entries[0].currentLocation.clone().sub(delta0).distanceTo(entries[1].currentLocation.clone().sub(delta1));

			if (this.pinchStartDistance === undefined)
				this.pinchStartDistance = currentDistance;

			this.zoom((currentDistance - previousDistance) / this.pinchStartDistance);
		}

		for (const pointerData of entries) {
			pointerData.lastFrameLocation = pointerData.currentLocation.clone();
		}

		this.camera.lookAt(this.target);
	}

	public clientToWorldSpace(clientCoordinate: Vector2) {
		var vector = new Vector3(
			clientCoordinate.x / this.element!.clientWidth * 2 - 2,
			(clientCoordinate.y / this.element!.clientHeight * 2 - 2) * -1,
			1
		);
		vector.unproject(this.camera);
		vector.sub(this.camera.position).normalize();
		return this.camera.position.clone().add(vector.multiplyScalar(this.distance));
	}

	public translate(offset: Vector3) {
		this.camera.position.add(offset);
		this.target.add(offset);
	}

	public zoom(offset: number) {
		if (!isFinite(offset) || isNaN(offset))
			return;

		const distance = this.distance;
		offset = offset * distance;
		if (distance - offset < this.minimumDistance) {
			offset = distance - this.minimumDistance;
		}
		this.camera.position.add(this.forward.multiplyScalar(offset));
	}

	public rotateHorizontally(offset: number) {
		this.camera.position.sub(this.target).applyAxisAngle(this.up, offset).add(this.target);
	}

    public rotateVertically(offset: number) {
        const verticalRotation = this.camera.getWorldDirection(new Vector3()).y;
		if (verticalRotation + offset < this.minimumVerticalRotation) {
			offset = this.minimumVerticalRotation - verticalRotation;
		}
		if (verticalRotation + offset > this.maximumVerticalRotation) {
			offset = this.maximumVerticalRotation - verticalRotation;
		}
		
		this.camera.position.sub(this.target).applyAxisAngle(this.right, -offset).add(this.target);
	}

	public save() {
		this.savedData = {
			target: this.target.clone(),
			cameraPosition: this.camera.position.clone(),
		};
	}

	public reset() {
		if (!this.savedData)
			return;

		this.target = this.savedData.target.clone();
		this.camera.position.set(this.savedData.cameraPosition.x, this.savedData.cameraPosition.y, this.savedData.cameraPosition.z);
	}

	public get forward(): Vector3 {
		return this.camera.getWorldDirection(new Vector3());
	}

	public get up(): Vector3 {
		return this.camera.up.clone();
	}

	public get right(): Vector3 {
		return this.camera.up.clone().cross(this.forward);
	}

	public get distance(): number {
		return this.camera.position.distanceTo(this.target);
	}

	private onKeyDown(e: KeyboardEvent) {
		this.keysDown[e.code] = true;
	}

	private onKeyUp(e: KeyboardEvent) {
		this.keysDown[e.code] = false;
	}

	private onPointerDown(e: PointerEvent) {
		this.pointersDown[e.pointerId] = {
			isMouse: e.pointerType == 'mouse',
			lastFrameLocation: new Vector2(e.clientX, e.clientY),
			currentLocation: new Vector2(e.clientX, e.clientY),
			startLocation: new Vector2(e.clientX, e.clientY),
		};
		if (e.target === null || !this.targetExceptions.includes(e.target))
			this.element?.setPointerCapture(e.pointerId);

		const pointers = Object.values(this.pointersDown);
		if (pointers.length == 2) {
			this.element?.focus({ preventScroll: true });
		}
	}

	private onPointerUp(e: PointerEvent) {
		delete this.pointersDown[e.pointerId];
		this.element?.releasePointerCapture(e.pointerId);
		this.pinchStartDistance = undefined;
	}

	private onPointerMove(e: PointerEvent) {
		const dataEntry = this.pointersDown[e.pointerId];
		if (e.pressure > 0 && dataEntry) {
			dataEntry.currentLocation.set(e.clientX, e.clientY);
		}
	}

	private onFocusOut(e: FocusEvent) {
		for (const key in this.keysDown) {
			this.keysDown[key] = false;
		}
		for (const pointer in this.pointersDown) {
			this.element?.releasePointerCapture(parseInt(pointer));
		}
		this.pointersDown = {};
		this.pinchStartDistance = undefined;
	}
}