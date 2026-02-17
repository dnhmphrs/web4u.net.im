<script>
	import { formatTimestamp } from '$lib/store/posts.js';
	
	/** @type {import('$lib/store/posts.js').Post} */
	export let post;
	
	export let open = false;
	export let onToggle = () => {};
</script>

<article class="post" class:open id={post.id}>
	<button class="post-header" on:click={onToggle}>
		<span class="from">{post.from}</span>
		<span class="subject">{post.subject}</span>
		<span class="toggle">{open ? '▼' : '▶'}</span>
	</button>

	{#if open}
		<div class="post-expanded">
			<aside class="post-meta">
				<dl>
					<dt>FROM</dt>
					<dd>{post.from}</dd>
					
					<dt>TO</dt>
					<dd>{post.to.join(', ')}</dd>
					
					{#if post.cc.length > 0}
						<dt>CC</dt>
						<dd>{post.cc.join(', ')}</dd>
					{/if}
					
					<dt>DATE</dt>
					<dd>{formatTimestamp(post.receivedAt)}</dd>
					
					<dt>MSG-ID</dt>
					<dd>{post.messageId}</dd>
					
					{#each Object.entries(post.headers) as [key, value]}
						<dt>{key}</dt>
						<dd>{value}</dd>
					{/each}
				</dl>
			</aside>
			
			<div class="post-body">
				{post.body}
			</div>
		</div>
	{/if}
</article>

<style>
	.post {
		border: 1px solid var(--primary-50);
		margin-bottom: 0.5rem;
	}
	
	.post.open {
		border-color: var(--primary);
	}
	
	.post-header {
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		display: flex;
		align-items: baseline;
		gap: 1rem;
		text-align: left;
		cursor: pointer;
	}
	
	.post-header:hover {
		background: var(--primary-10);
	}
	
	.from {
		flex-shrink: 0;
		font-size: 10px;
		color: var(--primary-50);
		width: 180px;
	}
	
	.subject {
		flex: 1;
		font-size: 12px;
	}
	
	.toggle {
		font-size: 8px;
		color: var(--primary-50);
		flex-shrink: 0;
	}
	
	.post-expanded {
		display: grid;
		grid-template-columns: 280px 1fr;
		border-top: 1px solid var(--primary-50);
	}
	
	.post-meta {
		padding: 1rem;
		font-size: 9px;
		line-height: 1.6;
		border-right: 1px solid var(--primary-50);
	}
	
	.post-meta dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.125rem 0.5rem;
		font-size: 10px;
	}
	
	.post-meta dt {
		color: var(--primary-50);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 10px;
	}
	
	.post-meta dd {
		word-break: break-all;
		font-size: 10px;
	}
	
	.post-body {
		padding: 1rem;
		white-space: pre-wrap;
		font-size: 12px;
		line-height: 1.7;
	}
	
	@media (max-width: 640px) {
		.from {
			width: auto;
		}
		
		.post-expanded {
			grid-template-columns: 1fr;
		}
		
		.post-meta {
			border-right: none;
			border-bottom: 1px solid var(--primary-50);
		}
		
		.post-meta dl {
			display: flex;
			flex-wrap: wrap;
			gap: 0.25rem 1rem;
		}
		
		.post-meta dt {
			display: inline;
		}
		
		.post-meta dt::after {
			content: ' ';
		}
		
		.post-meta dd {
			display: inline;
			margin-right: 1rem;
		}
	}
</style>