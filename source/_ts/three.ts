import { Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight, MathUtils, Vector3, Vector2, Mesh, Object3DEventMap, Box3, Object3D, BufferGeometry, Material, AnimationMixer, Clock, AnimationClip, Matrix4, Group, Euler } from 'three';
import { DRACOLoader, GLTFLoader, Sky, WebGL } from 'three/examples/jsm/Addons.js';
import { getCorners, isBot, isRunningOnBrowser, skip, translate } from './utils';
import './loading-circle';
import './touch-hint';

type ThreeJsElement = HTMLElement & {
	threejs: {
		scene: Scene,
		renderer: WebGLRenderer,
		camera: PerspectiveCamera,
		controls: OrbitControls,
		animation?: AnimationMixer,
	}
};

function initializeThreeJs(element: HTMLElement) {
	const model = element.getAttribute('model');
	if (model === null) {
		console.error("Threejs element doesn't have a model assigned.", element);
		return;
	}

	if (isThreeJsElement(element)) {
		console.warn("Element has already been initialized.", element);
		return;
	}

	if (!isRunningOnBrowser() || isBot()) {
		return;
	}

	element.tabIndex = 0;
	resizeObserver.observe(element);

	const scene = new Scene();
	const camera = new PerspectiveCamera(75, element.clientWidth / element.clientHeight, 0.1, 1000);

	const renderer = new WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setSize(element.clientWidth * window.devicePixelRatio, element.clientHeight * window.devicePixelRatio, false);
	element.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera);
	controls.attachEventHandlers(<HTMLElement>element);

	const threeJs = <ThreeJsElement>element;
	threeJs.threejs = {
		scene,
		renderer,
		camera,
		controls,
	};

	const sky = new Sky();
	sky.scale.setScalar(450000);
	const phi = MathUtils.degToRad(87);
	const theta = MathUtils.degToRad(135);
	const sunPosition = new Vector3().setFromSphericalCoords(1, phi, theta);

	sky.material.uniforms.sunPosition.value = sunPosition;

	scene.add(sky);

	const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
	hemiLight.color.setHSL(0.6, 0.75, 0.5);
	hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
	hemiLight.position.set(0, 500, 0);
	scene.add(hemiLight);

	const dirLight = new DirectionalLight(0xffffff, 1.6);
	dirLight.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
	dirLight.position.multiplyScalar(500);
	dirLight.castShadow = true;
	scene.add( dirLight );
	
	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('/js/libs/draco/');
	loader.setDRACOLoader(dracoLoader);
	
	const loadingCircle = document.createElement('loading-circle');
	element.appendChild(loadingCircle);

	const touchHint = <TouchHint>document.createElement('touch-hint');
	touchHint.hint = CONFIG.translations['touch-hint'];
	element.appendChild(touchHint);

	loader.load(model, (gltf) => {
		element.removeChild(loadingCircle);
		scene.add(gltf.scene);
		const boxes: Box3[] = [];
		processChildren(gltf.scene.children);
		
		if (boxes.length > 0) {
			const overallBox = boxes[0].clone();
			for (const box of skip(boxes, 1)) {
				for (const corner of getCorners(box))
					overallBox.expandByPoint(corner);
			}

			// TODO: move back far enough to fit the whole model onto the screen.
			controls.target = overallBox.getCenter(new Vector3());
		}

		function processChildren(children: Object3D[]) {
			for (const child of children) {
				if (child instanceof PerspectiveCamera) {
					controls.camera = child;
					child.aspect = camera.aspect;
					child.far = 1000;
					child.near = 0.1;
					threeJs.threejs.camera = child;
					child.updateProjectionMatrix();
					/*camera.position.set(child.position.x, child.position.y, child.position.z);
					camera.near = child.near;
					camera.far = child.far;
					camera.quaternion.set(child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w);*/
				}
				else if (child instanceof Mesh) {
					//Armature, SkinnedMesh
					const mesh = <Mesh<BufferGeometry, Material, Object3DEventMap>>child;
					boxes.push(mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrix));
				}

				processChildren(child.children);
			}
		}

		const animationsAttribute = element.getAttribute('animations');
		let animationList: AnimationClip[] = [];
		if (animationsAttribute?.startsWith('all')) {
			const exceptions = /^all except (?<exceptions>.+)/.exec(animationsAttribute)?.groups?.['exceptions'];
			if (exceptions === undefined) {
				console.warn(`"all" for animations is currently only supported if also an except is specified.`);
			} else {
				const names = exceptions.split(',').map(e => e.trim());
				animationList = gltf.animations.filter(a => !names.includes(a.name));
			}
		} else if (animationsAttribute?.startsWith('single')) {
			const name = /^single\s+(?<animation>.+)/.exec(animationsAttribute)?.groups?.['animation'];
			const animation = gltf.animations.find(a => a.name == name);
			if (animation === undefined) {
				console.warn(`Unable to find an animation with name "${name}".`);
			} else {
				animationList.push(animation);
			}
		}

		if (animationList.length > 0) {
			threeJs.threejs.animation = playAnimations(gltf.scene, animationList);
		}

		startLoop(threeJs);
		controls.save();

		//TODO: if no camera is part of the scene, try to find a good position.
		const icon = document.createElement("img");
		icon.className = "orbit";
		icon.src = "/icons/orbit.svg";
		icon.alt = translate('reset-view');
		icon.title = translate('reset-view');
		icon.addEventListener('click', () => {
			controls.reset();
		});
		element.appendChild(icon);
		controls.addTargetException(icon);
	}, (progress) => {
		// The numbers returned for the progress are useless, sometimes total is larger than loaded, sometimes the other way around and always is the total wrong.
		loadingCircle.setAttribute('progress', '' + progress.loaded);
	}, (error) => {
		console.error( error );
	});
}

function playAnimations(scene: Group<Object3DEventMap>, animations: AnimationClip[]): AnimationMixer {
	let animationIndex = 0;
	const mixer = new AnimationMixer(scene);
	// preload all animations (for which we have to play them until the end), otherwise we get T-poses between the animations when they are played for the first time.
	for (const animation of animations) {
		const action = mixer.clipAction(animation);
		action.repetitions = 0;
		action.play();
		mixer.update(animation.duration);
	}

	mixer.addEventListener('finished', () => {
		animationIndex = (animationIndex + 1) % animations.length;
		const action = mixer.clipAction(animations[animationIndex]);
		action.reset();
		action.play();
	});
	const action = mixer.clipAction(animations[animationIndex]);
	action.reset();
	action.play();

	return mixer;
}

function startLoop(element: ThreeJsElement) {
	const clock = new Clock();
	element.threejs!.renderer.setAnimationLoop(() => {
		const delta = clock.getDelta();
		element.threejs.controls.update(delta);
		element.threejs.animation?.update(delta);
		element.threejs.renderer.render(element.threejs.scene, element.threejs.camera);
	})
}

function stopLoop(element: ThreeJsElement) {
	element.threejs!.renderer.setAnimationLoop(null);
}

let resizeRequested = false;
const resizeObserver = new ResizeObserver((entries, _) => {
	for (const entry of entries) {
		if (!resizeRequested) {
			resizeRequested = true;
			setTimeout(() => {
				resizeRequested = false;
				if (isThreeJsElement(entry.target)) {
					entry.target.threejs.renderer.setSize(entry.contentRect.width * window.devicePixelRatio, entry.contentRect.height * window.devicePixelRatio, false);
					entry.target.threejs.camera.aspect = entry.contentRect.width / entry.contentRect.height;
				}
			});
		}
	}
});

function isThreeJsElement(element: Element): element is ThreeJsElement {
	return 'threejs' in element;
}

window.addEventListener('DOMContentLoaded', () => {
	const intersectionObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				if (isThreeJsElement(entry.target)) {
					startLoop(entry.target);
				} else {
					setTimeout(() => {
						initializeThreeJs(<HTMLElement>entry.target);
					});
				}
			} else if (isThreeJsElement(entry.target)) {
				stopLoop(entry.target);
			}
		}
	}, {
		threshold: [0],
	});
	
	for (const container of document.getElementsByTagName("threejs")) {
		if (WebGL.isWebGL2Available()) {
			intersectionObserver.observe(container);
		} else {
			const warning = WebGL.getWebGL2ErrorMessage();
			container.appendChild(warning);
		}
	}
});

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

class OrbitControls {
	public target: Vector3 = new Vector3();
	public camera: PerspectiveCamera;
	public keyboardTranslationSpeed = 0.5; // factor of current distance to target per second.
	public keyboardRotationSpeed = 2.5; // radiants per second
	public pointerRotationSpeed = Math.PI; // radiants per 1 full pointer move across the dom element
	public minimumDistance = 1;
	// poles at PI/2 and -PI/2 causing gimbal lock
	public minimumVerticalRotation = -Math.PI / 2 * 0.85;
	public maximumVerticalRotation = Math.PI / 2 * 0.85;

	private element: HTMLElement | undefined;
	private savedData: OrbitControlsData | null = null;
	private keysDown: Record<string, boolean> = {};
	private pointersDown: Record<string, PointerState> = {};
	private pinchStartDistance: number | undefined;
	private originalDistance: number | undefined;
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
		if (this.originalDistance === undefined) {
			this.originalDistance = this.distance;
		}

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

			if (this.keysDown['ShiftLeft']) {
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

		offset = offset * (this.originalDistance ?? 1);
		const distance = this.distance;
		if (distance - offset < this.minimumDistance) {
			offset = distance - this.minimumDistance;
		}
		this.camera.position.add(this.forward.multiplyScalar(offset));
	}

	public rotateHorizontally(offset: number) {
		this.camera.position.sub(this.target).applyAxisAngle(this.up, offset).add(this.target);
	}

	public rotateVertically(offset: number) {
		if (this.camera.rotation.x - offset < this.minimumVerticalRotation) {
			offset = this.camera.rotation.x - this.minimumVerticalRotation;
		}
		if (this.camera.rotation.x - offset > this.maximumVerticalRotation) {
			offset = this.camera.rotation.x - this.maximumVerticalRotation;
		}
		
		this.camera.position.sub(this.target).applyAxisAngle(this.right, offset).add(this.target);
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
