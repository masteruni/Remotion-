import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect, useMemo} from 'react';
import {
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {LightBackdrop, TiltShift, Vignette} from '../components/Backdrops';
import {Shot} from '../components/Shot';

/** Studio reflection map, shared by the scene and by materials that need extra reflection. */
const useRoomEnv = () => {
	const gl = useThree((s) => s.gl);
	return useMemo(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		const tex = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
		pmrem.dispose();
		return tex;
	}, [gl]);
};

/** Studio env with a bright softbox and coloured panels: gives chrome something to reflect. */
const useStudioEnv = () => {
	const gl = useThree((s) => s.gl);
	return useMemo(() => {
		const room = new RoomEnvironment();
		const panel = (color: string, intensity: number, pos: [number, number, number], size: [number, number]) => {
			const m = new THREE.Mesh(
				new THREE.PlaneGeometry(size[0], size[1]),
				new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide}),
			);
			m.position.set(...pos);
			m.lookAt(0, 0, 0);
			room.add(m);
		};
		panel('#ffffff', 12, [0, 9, 0], [8, 8]);
		panel('#FF5A4E', 6, [-9, 2, 3], [4, 10]);
		panel('#7FB2FF', 5, [9, 3, -3], [4, 10]);
		const pmrem = new THREE.PMREMGenerator(gl);
		const tex = pmrem.fromScene(room, 0.02).texture;
		pmrem.dispose();
		return tex;
	}, [gl]);
};

const Environment: React.FC = () => {
	const scene = useThree((s) => s.scene);
	const env = useRoomEnv();
	useLayoutEffect(() => {
		scene.environment = env;
		scene.environmentIntensity = 0.85;
		return () => {
			scene.environment = null;
		};
	}, [env, scene]);
	return null;
};

const CameraRig: React.FC<{x: number; height: number}> = ({x, height}) => {
	const camera = useThree((s) => s.camera);
	useLayoutEffect(() => {
		camera.position.set(x, height, 1.2);
		camera.lookAt(x, 0, 0.1);
		camera.updateProjectionMatrix();
	}, [camera, x, height]);
	return null;
};

const useGridPaper = () =>
	useMemo(() => {
		const size = 1024;
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d')!;
		ctx.fillStyle = '#ECECEE';
		ctx.fillRect(0, 0, size, size);
		const minor = size / 4;
		for (let i = 0; i <= 4; i++) {
			ctx.strokeStyle = '#A9A9B0';
			ctx.lineWidth = 7;
			ctx.beginPath();
			ctx.moveTo(i * minor, 0);
			ctx.lineTo(i * minor, size);
			ctx.moveTo(0, i * minor);
			ctx.lineTo(size, i * minor);
			ctx.stroke();
		}
		const tex = new THREE.CanvasTexture(canvas);
		tex.wrapS = THREE.RepeatWrapping;
		tex.wrapT = THREE.RepeatWrapping;
		tex.repeat.set(7, 7);
		tex.anisotropy = 8;
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}, []);

/** Drop with a bounce: height above the surface and a tumble that settles. */
const useDrop = (start: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({
		frame: frame - start,
		fps,
		config: {damping: 9, stiffness: 170, mass: 0.7},
	});
	const raw = 5 * (1 - p);
	return {
		visible: frame >= start,
		y: raw < 0 ? -raw * 0.55 : raw,
		tumble: 1 - p,
	};
};

const brushedMetal = {
	color: '#C9CCD2',
	metalness: 1,
	roughness: 0.3,
	anisotropy: 0.9,
	clearcoat: 0.25,
};

const Lens: React.FC<{start: number}> = ({start}) => {
	const {visible, y, tumble} = useDrop(start);
	return (
		<group
			visible={visible}
			position={[-3.2, y, 0.3]}
			rotation={[tumble * 0.9, tumble * 1.5, tumble * -0.6]}
		>
			<mesh castShadow receiveShadow position={[0, 0.3, 0]}>
				<cylinderGeometry args={[0.86, 0.9, 0.6, 128]} />
				<meshPhysicalMaterial {...brushedMetal} />
			</mesh>
			<mesh castShadow position={[0, 0.42, 0]}>
				<cylinderGeometry args={[0.92, 0.92, 0.2, 90]} />
				<meshStandardMaterial
					color="#2A2C31"
					metalness={0.7}
					roughness={0.45}
					flatShading
				/>
			</mesh>
			<mesh castShadow position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.74, 0.085, 32, 128]} />
				<meshPhysicalMaterial
					color="#E6E8EC"
					metalness={1}
					roughness={0.12}
					clearcoat={1}
				/>
			</mesh>
			<mesh position={[0, 0.6, 0]}>
				<cylinderGeometry args={[0.68, 0.68, 0.06, 96]} />
				<meshStandardMaterial color="#08080A" roughness={0.5} />
			</mesh>
			<mesh position={[0, 0.6, 0]} scale={[1, 0.38, 1]}>
				<sphereGeometry args={[0.6, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
				<meshPhysicalMaterial
					color="#10162A"
					metalness={0.1}
					roughness={0.03}
					clearcoat={1}
					clearcoatRoughness={0.02}
					iridescence={1}
					iridescenceIOR={1.9}
					iridescenceThicknessRange={[250, 750]}
					envMapIntensity={1.6}
				/>
			</mesh>
			<mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.3, 0.012, 16, 96]} />
				<meshStandardMaterial color="#5B6476" metalness={1} roughness={0.2} />
			</mesh>
		</group>
	);
};

const Diamond: React.FC<{start: number}> = ({start}) => {
	const frame = useCurrentFrame();
	const {visible, y, tumble} = useDrop(start);
	const env = useStudioEnv();
	const geometry = useMemo(() => {
		const pts = [
			new THREE.Vector2(0, -0.95),
			new THREE.Vector2(0.8, -0.02),
			new THREE.Vector2(0.8, 0.05),
			new THREE.Vector2(0.46, 0.4),
			new THREE.Vector2(0, 0.4),
		];
		return new THREE.LatheGeometry(pts, 16);
	}, []);
	return (
		<group
			visible={visible}
			position={[0, y + 0.72, -0.2]}
			rotation={[0.42 + tumble, frame * 0.015 + tumble * 2 + 0.4, 0.1]}
		>
			<mesh castShadow geometry={geometry}>
				<meshStandardMaterial
					color="#FFFFFF"
					metalness={1}
					roughness={0.02}
					flatShading
					envMap={env}
					envMapIntensity={1.4}
				/>
			</mesh>
		</group>
	);
};

const roundedRect = (w: number, h: number, r: number) => {
	const s = new THREE.Shape();
	const x = -w / 2;
	const y = -h / 2;
	s.moveTo(x + r, y);
	s.lineTo(x + w - r, y);
	s.quadraticCurveTo(x + w, y, x + w, y + r);
	s.lineTo(x + w, y + h - r);
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	s.lineTo(x + r, y + h);
	s.quadraticCurveTo(x, y + h, x, y + h - r);
	s.lineTo(x, y + r);
	s.quadraticCurveTo(x, y, x + r, y);
	return s;
};

const PlayButton: React.FC<{start: number}> = ({start}) => {
	const {visible, y, tumble} = useDrop(start);
	const env = useRoomEnv();
	const [base, tri] = useMemo(() => {
		const b = new THREE.ExtrudeGeometry(roundedRect(1.5, 1.5, 0.42), {
			depth: 0.28,
			bevelEnabled: true,
			bevelThickness: 0.1,
			bevelSize: 0.1,
			bevelSegments: 10,
			curveSegments: 24,
		});
		b.center();
		const t = new THREE.Shape();
		t.moveTo(-0.2, -0.3);
		t.lineTo(0.34, 0);
		t.lineTo(-0.2, 0.3);
		t.closePath();
		const tg = new THREE.ExtrudeGeometry(t, {
			depth: 0.06,
			bevelEnabled: true,
			bevelThickness: 0.04,
			bevelSize: 0.035,
			bevelSegments: 6,
		});
		tg.center();
		return [b, tg];
	}, []);
	return (
		<group
			visible={visible}
			position={[3.2, y + 0.24, 0.9]}
			rotation={[-Math.PI / 2 + tumble * 0.8, tumble * -0.6, -0.2 + tumble * 1.2]}
		>
			<mesh castShadow receiveShadow geometry={base}>
				<meshPhysicalMaterial
					color="#FF3B30"
					roughness={0.28}
					clearcoat={1}
					clearcoatRoughness={0.06}
					envMap={env}
					envMapIntensity={0.45}
				/>
			</mesh>
			<mesh castShadow geometry={tri} position={[0.03, 0, 0.27]}>
				<meshPhysicalMaterial color="#FFFFFF" roughness={0.15} clearcoat={1} />
			</mesh>
		</group>
	);
};

const Table: React.FC = () => {
	const paper = useGridPaper();
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<planeGeometry args={[40, 40]} />
			<meshStandardMaterial map={paper} roughness={0.92} />
		</mesh>
	);
};

const ObjectsStage: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const camX = interpolate(frame, [0, 45], [-1.3, 1.3], {
		easing: Easing.inOut(Easing.sin),
	});
	const camY = interpolate(frame, [0, 45], [14.5, 13.6]);
	return (
		<ThreeCanvas
			width={width}
			height={height}
			shadows
			camera={{fov: 30, position: [0, 14.5, 1.2], near: 0.1, far: 100}}
			gl={{antialias: true, preserveDrawingBuffer: true}}
		>
			<color attach="background" args={['#ECECEE']} />
			<Environment />
			<CameraRig x={camX} height={camY} />
			<ambientLight intensity={0.12} />
			<hemisphereLight args={['#ffffff', '#d9dde4', 0.25]} />
			<directionalLight
				position={[-4, 9, -4.5]}
				intensity={3.2}
				castShadow
				shadow-mapSize={[2048, 2048]}
				shadow-camera-left={-7}
				shadow-camera-right={7}
				shadow-camera-top={7}
				shadow-camera-bottom={-7}
				shadow-bias={-0.0004}
				shadow-normalBias={0.02}
				shadow-radius={3}
			/>
			<directionalLight position={[-6, 4, -3]} intensity={0.7} color="#dfe8ff" />
			<pointLight position={[-1, 3, 2]} intensity={14} distance={10} color="#ffffff" />
			<pointLight position={[2, 2.5, -2]} intensity={10} distance={8} color="#ffe9e2" />
			<Table />
			<Lens start={4} />
			<Diamond start={10} />
			<PlayButton start={16} />
		</ThreeCanvas>
	);
};

export const ObjectsScene: React.FC<{durationInFrames: number}> = ({
	durationInFrames,
}) => (
	<Shot
		durationInFrames={durationInFrames}
		enter="left"
		exit="up"
		background={<LightBackdrop />}
	>
		<ObjectsStage />
		<TiltShift amount={3} band={18} />
		<Vignette strength={0.18} />
	</Shot>
);
