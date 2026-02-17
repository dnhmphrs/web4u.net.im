<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let canvasElement;
	let renderer;
	let animationFrameId;

	onMount(() => {
		const scene = new THREE.Scene();
		
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);
		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(0x232323, 0); // Plain background color

		function animate() {
			animationFrameId = requestAnimationFrame(animate);
			renderer.render(scene, camera);
		}

		function handleResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}

		animate();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationFrameId);
			renderer.dispose();
		};
	});
</script>

<canvas bind:this={canvasElement}></canvas>

<style>	
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100dvh;
	}
</style>