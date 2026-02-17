<script>
	import { formatTimestamp, formatSize } from '$lib/store/posts.js';
	
	/** @type {import('$lib/store/posts.js').Post} */
	export let post;
	
	let expanded = false;
</script>

<article class="post" id={post.id}>
	<header class="meta">
		<div class="meta-row">
			<span class="label">FROM</span>
			<span class="value author" data-author={post.author}>{post.from}</span>
		</div>
		<div class="meta-row">
			<span class="label">DATE</span>
			<span class="value mono">{formatTimestamp(post.receivedAt)}</span>
		</div>
		<div class="meta-row">
			<span class="label">SUBJ</span>
			<span class="value subject">{post.subject}</span>
		</div>
		{#if post.to.length > 0}
			<div class="meta-row secondary">
				<span class="label">TO</span>
				<span class="value mono">{post.to.join(', ')}</span>
			</div>
		{/if}
		{#if post.cc.length > 0}
			<div class="meta-row secondary">
				<span class="label">CC</span>
				<span class="value mono">{post.cc.join(', ')}</span>
			</div>
		{/if}
		
		<button 
			class="headers-toggle" 
			on:click={() => expanded = !expanded}
			aria-expanded={expanded}
		>
			{expanded ? '[-]' : '[+]'} headers
		</button>
		
		{#if expanded}
			<div class="headers">
				<div class="meta-row secondary">
					<span class="label">MSG-ID</span>
					<span class="value mono">{post.messageId}</span>
				</div>
				{#each Object.entries(post.headers) as [key, value]}
					<div class="meta-row secondary">
						<span class="label">{key}</span>
						<span class="value mono">{value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</header>
	
	<div class="body">
		{post.body}
	</div>
	
	{#if post.attachments.length > 0}
		<footer class="attachments">
			<span class="label">ATTACHMENTS</span>
			<ul>
				{#each post.attachments as attachment}
					<li>
						<a href={attachment.url} target="_blank" rel="noopener">
							{attachment.filename}
						</a>
						<span class="file-meta">[{attachment.type}, {formatSize(attachment.size)}]</span>
					</li>
				{/each}
			</ul>
		</footer>
	{/if}
</article>

<style>
	.post {
		border-top: 1px solid var(--primary-20);
		padding: 2rem 0;
	}
	
	.post:first-child {
		border-top: none;
	}
	
	.meta {
		margin-bottom: 1.5rem;
	}
	
	.meta-row {
		display: flex;
		gap: 1rem;
		line-height: 1.6;
	}
	
	.meta-row.secondary {
		opacity: 0.6;
	}
	
	.label {
		flex-shrink: 0;
		width: 4rem;
		color: var(--primary-50);
		font-size: 10px;
		letter-spacing: 0.15em;
	}
	
	.value {
		flex: 1;
		word-break: break-word;
	}
	
	.value.mono {
		font-family: var(--font-mono);
	}
	
	.value.author {
		color: var(--accent);
	}
	
	.value.subject {
		font-weight: 600;
	}
	
	.headers-toggle {
		background: none;
		border: none;
		color: var(--primary-30);
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		cursor: pointer;
		padding: 0.5rem 0;
		transition: color 0.15s ease;
	}
	
	.headers-toggle:hover {
		color: var(--primary-50);
	}
	
	.headers {
		margin-top: 0.5rem;
		padding-left: 0;
		animation: fadeIn 0.15s ease;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	.body {
		white-space: pre-wrap;
		font-family: var(--font-body);
		line-height: 1.7;
		max-width: 60ch;
	}
	
	.attachments {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px dashed var(--primary-10);
	}
	
	.attachments .label {
		display: block;
		margin-bottom: 0.5rem;
		width: auto;
	}
	
	.attachments ul {
		list-style: none;
	}
	
	.attachments li {
		font-family: var(--font-mono);
		font-size: 11px;
	}
	
	.attachments a {
		color: var(--accent);
	}
	
	.attachments a:hover {
		text-decoration: underline;
	}
	
	.file-meta {
		color: var(--primary-30);
		margin-left: 0.5rem;
	}
</style>