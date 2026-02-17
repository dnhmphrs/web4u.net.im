<script>
	import { postsByDate, authors } from '$lib/store/posts.js';
	import Post from '$lib/components/Post.svelte';
</script>

<main>
	<header class="site-header">
		<div class="title">
			<h1>web4u<span class="tld">.net.im</span></h1>
			<p class="tagline">web, but for you.</p>
		</div>
		<div class="info">
			<div class="stat">
				<span class="stat-label">posts</span>
				<span class="stat-value">{$postsByDate.length}</span>
			</div>
			<div class="stat">
				<span class="stat-label">authors</span>
				<span class="stat-value">{$authors.length}</span>
			</div>
			<div class="stat">
				<span class="stat-label">protocol</span>
				<span class="stat-value">SMTP→HTTP</span>
			</div>
		</div>
	</header>
	
	<section class="feed">
		{#each $postsByDate as post (post.id)}
			<Post {post} />
		{/each}
	</section>
	
	<footer class="site-footer">
		<p>↳ post@web4u.net.im</p>
		<p class="note">authorised senders only. all else /dev/null.</p>
	</footer>
</main>

<style>
	main {
		width: calc(100vw - 24px);
		margin: 0 0 0 auto;
		padding: var(--margin);
		padding-top: 4rem;
		padding-bottom: 4rem;
		background: var(--background);
		overflow: auto;
		display: flex;
		flex-flow: row;
	}
	
	.site-header {
		margin-bottom: 4rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid var(--primary);
	}
	
	.title h1 {
		font-family: var(--font-mono);
		font-size: clamp(28px, 6vw, 42px);
		font-weight: 400;
		letter-spacing: -0.02em;
		line-height: 1;
		margin-bottom: 0.25rem;
	}
	
	.title .tld {
		color: var(--primary-30);
	}
	
	.tagline {
		color: var(--primary-50);
		font-size: 13px;
		letter-spacing: 0.05em;
	}
	
	.info {
		display: flex;
		gap: 2rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}
	
	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	
	.stat-label {
		font-size: 9px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--primary-30);
	}
	
	.stat-value {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--accent);
	}
	
	.feed {
		/* posts handle their own spacing */
		max-width: 720px;
	}
	
	.site-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--primary-20);
	}
	
	.site-footer p {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--primary-50);
	}
	
	.site-footer .note {
		font-size: 10px;
		color: var(--primary-30);
		margin-top: 0.25rem;
	}
</style>