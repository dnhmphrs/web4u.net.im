<script>
	import './styles.css';

	import { onMount } from 'svelte';
	import { screenType, isIframe } from '$lib/store/store';

	let Scene;

	onMount(async () => {
		// webgl
		const module = await import('$lib/three/scene.svelte');
		Scene = module.default;

		function getDeviceType() {
			const width =
				window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

			if (
				'ontouchstart' in window ||
				navigator.maxTouchPoints > 0 ||
				navigator.msMaxTouchPoints > 0
			) {
				// This is a device which supports touch
				if (width <= 767) {
					// Mobile
					return 1;
				} else {
					// Tablet
					return 2;
				}
			} else {
				// This is likely a laptop or desktop
				return 3;
			}
		}

		screenType.set(getDeviceType());
		isIframe.set(window.location !== window.parent.location);
	});
</script>

<svelte:head>
	<title>web4u.net.im</title>
	<meta name="description" content="" />
	<meta
		name="keywords"
		content="web4"
	/>
	<meta name="author" content="web4u" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta property="og:title" content="web4u.net.im" />
	<meta
		property="og:description"
		content="web, but 4 you."
	/>
	<meta property="og:image" content="https://web4u.net.im/square.png" />
</svelte:head>

<slot />

{#if Scene}
	<svelte:component this={Scene} />
{/if}


<style>
</style>
