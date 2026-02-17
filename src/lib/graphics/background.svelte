<script>
	import { onMount } from 'svelte';

	let canvas;

	onMount(() => {
		const gl = canvas.getContext('webgl');
		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		// --- Shader sources ---
		const vertexShaderSource = `
			attribute vec2 position;
			varying vec2 vUv;
			void main() {
				vUv = position + 1.0;
				gl_Position = vec4(position, 0, 1);
			}
		`;

		const fragmentShaderSource = `
			precision highp float;

			#define PI 3.1415926535897932384626433832795

			varying vec2 vUv;
			uniform float time;
			uniform float aspectRatio;

			vec2 rotate(vec2 p, float angle) {
				float s = sin(angle);
				float c = cos(angle);
				return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
			}

			float hexagon(vec2 p, float scale, float rotation) {
				const float sqrt3 = 1.7320508075688772;
				p = rotate(p, rotation);
				p.x *= aspectRatio;
				
				vec2 a = mod(p, vec2(3.0 * scale, sqrt3 * scale)) - vec2(1.5 * scale, sqrt3 / 2.0 * scale);
				vec2 b = mod(p - vec2(1.5 * scale, sqrt3 / 2.0 * scale), vec2(3.0 * scale, sqrt3 * scale)) - vec2(1.5 * scale, sqrt3 / 2.0 * scale);

				return -(min(dot(a, a), dot(b, b)) - (1.0 / 4.0) * scale * scale);
			}

			void main() {
				vec2 uv = vUv - 1.0;

				float scale = PI / 2.0;
				float baseAngle = PI / 2.0;

				float dist1 = hexagon(uv, 1.0, 0.0);
				float dist2 = hexagon(uv, 1.0 / scale, baseAngle);
				float dist3 = hexagon(uv, 1.0 / pow(scale, 2.0), baseAngle * 2.0);
				float dist4 = hexagon(uv, 1.0 / pow(scale, 3.0), baseAngle * 3.0);
				float dist5 = hexagon(uv, 1.0 / pow(scale, 4.0), baseAngle * 4.0);
				float dist6 = hexagon(uv, 1.0 / pow(scale, 5.0), baseAngle * 5.0);
				float dist7 = hexagon(uv, 1.0 / pow(scale, 6.0), baseAngle * 6.0);
				float dist8 = hexagon(uv, 1.0 / pow(scale, 7.0), baseAngle * 7.0);

				float scaledTime = (time * scale * 0.0000001) + 2.0;

				vec3 color1 = vec3(0.3 + 0.7 * tan(scaledTime / dist1), 0.3 + 0.7 * sin(scaledTime / dist1), 0.3 + 0.7 * cos(scaledTime / dist1));
				vec3 color2 = vec3(0.3 + 0.7 * tan(scaledTime / dist2), 0.3 + 0.7 * sin(scaledTime / dist2), 0.3 + 0.7 * cos(scaledTime / dist2));
				vec3 color3 = vec3(0.3 + 0.7 * tan(scaledTime / dist3), 0.3 + 0.7 * sin(scaledTime / dist3), 0.3 + 0.7 * cos(scaledTime / dist3));
				vec3 color4 = vec3(0.3 + 0.7 * tan(scaledTime / dist4), 0.3 + 0.7 * sin(scaledTime / dist4), 0.3 + 0.7 * cos(scaledTime / dist4));
				vec3 color5 = vec3(0.3 + 0.7 * tan(scaledTime / dist5), 0.3 + 0.7 * sin(scaledTime / dist5), 0.3 + 0.7 * cos(scaledTime / dist5));
				vec3 color6 = vec3(0.3 + 0.7 * tan(scaledTime / dist6), 0.3 + 0.7 * sin(scaledTime / dist6), 0.3 + 0.7 * cos(scaledTime / dist6));
				vec3 color7 = vec3(0.3 + 0.7 * tan(scaledTime / dist7), 0.3 + 0.7 * sin(scaledTime / dist7), 0.3 + 0.7 * cos(scaledTime / dist7));
				vec3 color8 = vec3(0.3 + 0.7 * tan(scaledTime / dist8), 0.3 + 0.7 * sin(scaledTime / dist8), 0.3 + 0.7 * cos(scaledTime / dist8));

				vec3 color = mix(color1, color2, 0.5);
				color = mix(color, color3, 0.5);
				color = mix(color, color4, 0.5);
				color = mix(color, color5, 0.5);
				color = mix(color, color6, 0.5);
				color = mix(color, color7, 0.5);
				color = mix(color, color8, 0.5);

				gl_FragColor = vec4(color, 1.0);
			}
		`;

		// --- Compile shaders ---
		function compileShader(type, source) {
			const shader = gl.createShader(type);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error('Shader compile error:', gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}
			return shader;
		}

		const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Program link error:', gl.getProgramInfoLog(program));
			return;
		}

		// --- Setup geometry (fullscreen quad) ---
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1, -1,
			 1, -1,
			-1,  1,
			-1,  1,
			 1, -1,
			 1,  1
		]), gl.STATIC_DRAW);

		const positionLocation = gl.getAttribLocation(program, 'position');
		const timeLocation = gl.getUniformLocation(program, 'time');
		const aspectRatioLocation = gl.getUniformLocation(program, 'aspectRatio');

		// --- Resize handling ---
		let aspectRatio = 1;

		function resize() {
			const dpr = window.devicePixelRatio || 1;
			const width = canvas.clientWidth * dpr | 0;
			const height = canvas.clientHeight * dpr | 0;

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
				aspectRatio = width / height;
				gl.viewport(0, 0, width, height);
			}
		}

		window.addEventListener('resize', resize);
		resize();

		// --- Render loop ---
		let animationId;

		function render() {
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(program);
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(positionLocation);

			gl.uniform1f(timeLocation, performance.now());
			gl.uniform1f(aspectRatioLocation, aspectRatio);

			gl.drawArrays(gl.TRIANGLES, 0, 6);

			animationId = requestAnimationFrame(render);
		}

		animationId = requestAnimationFrame(render);

		// --- Cleanup ---
		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteBuffer(positionBuffer);
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
	}
</style>