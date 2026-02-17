import { writable, derived } from 'svelte/store';

/**
 * @typedef {Object} Attachment
 * @property {string} filename
 * @property {string} type - mime type
 * @property {string} url - path to file
 * @property {number} size - bytes
 */

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} from - email address
 * @property {string} author - display name
 * @property {string} subject
 * @property {string} body - plain text or markdown
 * @property {string} receivedAt - ISO timestamp
 * @property {string} messageId - email Message-ID header
 * @property {string[]} to - recipient addresses
 * @property {string[]} cc - cc addresses
 * @property {Attachment[]} attachments
 * @property {Object} headers - raw email headers
 */

/** @type {Post[]} */
const initialPosts = [
	{
		id: 'post-001',
		from: 'dan@aufbau.io',
		author: 'dan',
		subject: 'first transmission',
		body: `testing the wire.

this is web4u. a place to think out loud without the algorithmic gaze.

email in, web out. that's it.`,
		receivedAt: '2026-02-17T14:32:00Z',
		messageId: '<001@aufbau.io>',
		to: ['post@web4u.net.im'],
		cc: [],
		attachments: [],
		headers: {
			'X-Mailer': 'Apple Mail (2.3774.400.31)',
			'Content-Type': 'text/plain; charset=utf-8'
		}
	},
	{
		id: 'post-002',
		from: 'kes@web4u.net.im',
		author: 'kes',
		subject: 're: what does web4 mean to us',
		body: `for me its about intention. 

web2 optimised for engagement. web3 optimised for speculation. 

what if we optimised for... nothing? or for slowness? for the act of writing something down and letting it exist without metrics.

i keep thinking about that line - "a web that works for you" - and how radical that actually is when you say it out loud.`,
		receivedAt: '2026-02-17T16:45:00Z',
		messageId: '<002@web4u.net.im>',
		to: ['post@web4u.net.im'],
		cc: ['dan@aufbau.io'],
		attachments: [],
		headers: {
			'X-Mailer': 'Thunderbird 128.0',
			'Content-Type': 'text/plain; charset=utf-8'
		}
	},
	{
		id: 'post-003',
		from: 'billy@darkforest.net',
		author: 'billy',
		subject: 'on servers and sovereignty',
		body: `the server question is the real question.

every centralised service is a potential point of capture. not just by corporations - by states, by infrastructure failures, by the slow drift of enshittification.

self-hosted servers talking to each other. that's the topology. mesh, not hub-and-spoke.

even better: long-range radio. LoRa modules can hit 10km line-of-sight. satellite-independent communication. 

sounds paranoid until you remember that "paranoid" is just "paying attention" with a time delay.`,
		receivedAt: '2026-02-18T09:12:00Z',
		messageId: '<003@darkforest.net>',
		to: ['post@web4u.net.im'],
		cc: [],
		attachments: [
			{
				filename: 'mesh-topology.png',
				type: 'image/png',
				url: '/attachments/mesh-topology.png',
				size: 24576
			}
		],
		headers: {
			'X-Mailer': 'mutt/2.2.12',
			'Content-Type': 'multipart/mixed'
		}
	},
	{
		id: 'post-004',
		from: 'dan@aufbau.io',
		author: 'dan',
		subject: 'infrastructure notes',
		body: `got the pi. setting up the mail receiver tonight.

stack so far:
- maddy for SMTP
- node script watches maildir
- parses email → markdown + frontmatter  
- triggers sveltekit rebuild
- git push to vercel

all running on 8gb pi 5 in my flat. 
the server is in a cupboard. this feels right.

next: figure out attachment handling. images should inline, pdfs should link.`,
		receivedAt: '2026-02-19T22:08:00Z',
		messageId: '<004@aufbau.io>',
		to: ['post@web4u.net.im'],
		cc: ['kes@web4u.net.im', 'billy@darkforest.net'],
		attachments: [],
		headers: {
			'X-Mailer': 'Apple Mail (2.3774.400.31)',
			'Content-Type': 'text/plain; charset=utf-8'
		}
	}
];

export const posts = writable(initialPosts);

export const postsByDate = derived(posts, ($posts) => {
	return [...$posts].sort((a, b) => 
		new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
	);
});

export const authors = derived(posts, ($posts) => {
	const unique = [...new Set($posts.map(p => p.author))];
	return unique;
});

/**
 * Format timestamp for display
 * @param {string} isoString
 * @returns {string}
 */
export function formatTimestamp(isoString) {
	const date = new Date(isoString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format file size for display
 * @param {number} bytes
 * @returns {string}
 */
export function formatSize(bytes) {
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}