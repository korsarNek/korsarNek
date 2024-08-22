import { Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight, MathUtils, Vector3, Vector2, Mesh, Object3DEventMap, Box3, Object3D, BufferGeometry, Material, AnimationMixer, Clock, AnimationClip, Matrix4, Group, Euler } from 'three';
import { DRACOLoader, GLTFLoader, Sky, WebGL } from 'three/examples/jsm/Addons.js';
import { getCorners, isBot, isRunningOnBrowser, skip, translate } from './utils';
import './loading-circle';
import './touch-hint';
import { TouchHint } from './touch-hint';
import { OrbitControls } from './orbit-controls';

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
