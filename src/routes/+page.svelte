<script>
	import { postsByDate, authors } from '$lib/store/posts.js';
	import Post from '$lib/components/Post.svelte';
	
	let openPostId = null;
	
	function handleToggle(postId) {
		openPostId = openPostId === postId ? null : postId;
	}
</script>

<main>
	<header class="site-header">
		<div class="site-title">
			<h1>web4u.net.im</h1>
		</div>
		<div class="site-meta">
			<span>{$postsByDate.length} posts</span>
			<span class="sep">/</span>
			<span>{$authors.length} authors</span>
			<span class="sep">/</span>
			<span>SMTP→HTTP</span>
		</div>
	</header>
	
	<section class="feed">
		{#each $postsByDate as post (post.id)}
			<Post 
				{post} 
				open={openPostId === post.id}
				onToggle={() => handleToggle(post.id)}
			/>
		{/each}
	</section>
	
	<footer class="site-footer">
		<span>post@web4u.net.im</span>
		<span class="sep">/</span>
		<span>authorised senders only</span>
	</footer>
</main>

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.site-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--primary);
	}
	
	.site-title h1 {
		font-size: 16px;
		font-weight: 400;
		letter-spacing: 0.02em;
		margin-bottom: 0.5rem;
	}
	
	.site-meta {
		display: flex;
		gap: 0.5rem;
		font-size: 11px;
		color: var(--primary-50);
	}
	
	.sep {
		color: var(--primary-50);
	}
	
	.feed {
		flex: 1;
	}
	
	.site-footer {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--primary);
		display: flex;
		gap: 0.5rem;
		font-size: 11px;
		color: var(--primary-50);
	}
</style>