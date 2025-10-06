<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import { onMount } from 'svelte';
	
	// Props using Svelte 5 $props
	let {
		content = $bindable(''),
		placeholder = 'Start writing...',
		editable = true,
		minHeight = '300px'
	} = $props();
	
	// Local state with Svelte 5 runes
	let editorElement: HTMLDivElement;
	let editor: Editor | null = $state(null);
	let isFocused = $state(false);
	let showLinkModal = $state(false);
	let linkUrl = $state('');
	let linkText = $state('');
	
	// Initialize editor on mount
	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4, 5, 6]
					}
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'editor-link'
					}
				})
			],
			content: content,
			editable: editable,
			onUpdate: ({ editor }) => {
				// Update content when editor changes
				content = editor.getHTML();
			},
			onFocus: () => {
				isFocused = true;
			},
			onBlur: () => {
				isFocused = false;
			},
			editorProps: {
				attributes: {
					class: 'tiptap-content',
					style: `min-height: ${minHeight};`
				}
			}
		});
		
		// Cleanup on unmount
		return () => {
			editor?.destroy();
		};
	});
	
	// Update editor content when prop changes externally
	$effect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	});
	
	// Update editable state when prop changes
	$effect(() => {
		if (editor) {
			editor.setEditable(editable);
		}
	});
	
	// Toolbar actions
	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}
	
	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}
	
	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}
	
	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}
	
	function toggleHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}
	
	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}
	
	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}
	
	function toggleCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}
	
	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}
	
	function setHorizontalRule() {
		editor?.chain().focus().setHorizontalRule().run();
	}
	
	function undo() {
		editor?.chain().focus().undo().run();
	}
	
	function redo() {
		editor?.chain().focus().redo().run();
	}
	
	// Check if command is active
	const isActive = (name: string, attrs = {}) => {
		return editor?.isActive(name, attrs) ?? false;
	};
	
	// Link management functions
	function openLinkModal() {
		const previousUrl = editor?.getAttributes('link').href || '';
		const { from, to } = editor?.state.selection || { from: 0, to: 0 };
		const text = editor?.state.doc.textBetween(from, to, ' ');
		
		linkUrl = previousUrl;
		linkText = text || '';
		showLinkModal = true;
	}
	
	function setLink() {
		if (!linkUrl) {
			showLinkModal = false;
			return;
		}
		
		// Ensure URL has a protocol
		let url = linkUrl;
		if (!/^https?:\/\//i.test(url)) {
			url = 'https://' + url;
		}
		
		// If there's text to wrap, use it
		if (linkText && editor?.state.selection.empty) {
			editor
				?.chain()
				.focus()
				.insertContent(`<a href="${url}">${linkText}</a>`)
				.run();
		} else {
			editor
				?.chain()
				.focus()
				.extendMarkRange('link')
				.setLink({ href: url })
				.run();
		}
		
		showLinkModal = false;
		linkUrl = '';
		linkText = '';
	}
	
	function removeLink() {
		editor?.chain().focus().unsetLink().run();
	}
	
	function closeLinkModal() {
		showLinkModal = false;
		linkUrl = '';
		linkText = '';
	}
	
	// Derived states for button active states
	const boldActive = $derived(isActive('bold'));
	const italicActive = $derived(isActive('italic'));
	const strikeActive = $derived(isActive('strike'));
	const codeActive = $derived(isActive('code'));
	const bulletListActive = $derived(isActive('bulletList'));
	const orderedListActive = $derived(isActive('orderedList'));
	const codeBlockActive = $derived(isActive('codeBlock'));
	const blockquoteActive = $derived(isActive('blockquote'));
	const linkActive = $derived(isActive('link'));
</script>

<div class="tiptap-editor" class:focused={isFocused}>
	{#if editor}
		<div class="toolbar">
			<div class="toolbar-group">
				<button
					type="button"
					onclick={toggleBold}
					class:active={boldActive}
					title="Bold (Ctrl+B)"
				>
					<strong>B</strong>
				</button>
				<button
					type="button"
					onclick={toggleItalic}
					class:active={italicActive}
					title="Italic (Ctrl+I)"
				>
					<em>I</em>
				</button>
				<button
					type="button"
					onclick={toggleStrike}
					class:active={strikeActive}
					title="Strikethrough"
				>
					<s>S</s>
				</button>
				<button
					type="button"
					onclick={toggleCode}
					class:active={codeActive}
					title="Inline Code"
				>
					&lt;/&gt;
				</button>
				<button
					type="button"
					onclick={openLinkModal}
					class:active={linkActive}
					title="Add Link (Ctrl+K)"
				>
					🔗
				</button>
				{#if linkActive}
					<button
						type="button"
						onclick={removeLink}
						title="Remove Link"
					>
						🔗✕
					</button>
				{/if}
			</div>
			
			<div class="toolbar-separator"></div>
			
			<div class="toolbar-group">
				<button
					type="button"
					onclick={() => toggleHeading(1)}
					class:active={isActive('heading', { level: 1 })}
					title="Heading 1"
				>
					H1
				</button>
				<button
					type="button"
					onclick={() => toggleHeading(2)}
					class:active={isActive('heading', { level: 2 })}
					title="Heading 2"
				>
					H2
				</button>
				<button
					type="button"
					onclick={() => toggleHeading(3)}
					class:active={isActive('heading', { level: 3 })}
					title="Heading 3"
				>
					H3
				</button>
			</div>
			
			<div class="toolbar-separator"></div>
			
			<div class="toolbar-group">
				<button
					type="button"
					onclick={toggleBulletList}
					class:active={bulletListActive}
					title="Bullet List"
				>
					• List
				</button>
				<button
					type="button"
					onclick={toggleOrderedList}
					class:active={orderedListActive}
					title="Ordered List"
				>
					1. List
				</button>
			</div>
			
			<div class="toolbar-separator"></div>
			
			<div class="toolbar-group">
				<button
					type="button"
					onclick={toggleCodeBlock}
					class:active={codeBlockActive}
					title="Code Block"
				>
					Code
				</button>
				<button
					type="button"
					onclick={toggleBlockquote}
					class:active={blockquoteActive}
					title="Quote"
				>
					"
				</button>
				<button
					type="button"
					onclick={setHorizontalRule}
					title="Horizontal Line"
				>
					—
				</button>
			</div>
			
			<div class="toolbar-separator"></div>
			
			<div class="toolbar-group">
				<button
					type="button"
					onclick={undo}
					disabled={!editor?.can().undo()}
					title="Undo (Ctrl+Z)"
				>
					↶
				</button>
				<button
					type="button"
					onclick={redo}
					disabled={!editor?.can().redo()}
					title="Redo (Ctrl+Shift+Z)"
				>
					↷
				</button>
			</div>
		</div>
	{/if}
	
	<div class="editor-wrapper">
		<div bind:this={editorElement}></div>
	</div>
</div>

{#if showLinkModal}
	<div class="modal-overlay" onclick={closeLinkModal}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<h3>Insert Link</h3>
			
			<div class="modal-form">
				<div class="form-field">
					<label for="link-url">URL</label>
					<input
						id="link-url"
						type="text"
						bind:value={linkUrl}
						placeholder="https://example.com"
						onkeydown={(e) => e.key === 'Enter' && setLink()}
					/>
				</div>
				
				<div class="form-field">
					<label for="link-text">Link Text (optional)</label>
					<input
						id="link-text"
						type="text"
						bind:value={linkText}
						placeholder="Enter link text"
						onkeydown={(e) => e.key === 'Enter' && setLink()}
					/>
					<span class="field-hint">Leave empty to use selected text</span>
				</div>
			</div>
			
			<div class="modal-actions">
				<button type="button" onclick={closeLinkModal} class="btn-cancel">
					Cancel
				</button>
				<button type="button" onclick={setLink} class="btn-primary">
					Insert Link
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.tiptap-editor {
		border: 1px solid #ccc;
		border-radius: 6px;
		background: white;
		transition: border-color 0.2s;
	}
	
	.tiptap-editor.focused {
		border-color: #0066cc;
		box-shadow: 0 0 0 1px #0066cc;
	}
	
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem;
		border-bottom: 1px solid #e0e0e0;
		background: #f8f9fa;
		border-radius: 6px 6px 0 0;
	}
	
	.toolbar-group {
		display: flex;
		gap: 0.25rem;
	}
	
	.toolbar-separator {
		width: 1px;
		background: #d0d0d0;
		margin: 0 0.25rem;
	}
	
	.toolbar button {
		padding: 0.375rem 0.625rem;
		border: 1px solid #d0d0d0;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		color: #333;
		transition: all 0.15s;
		min-width: 32px;
	}
	
	.toolbar button:hover:not(:disabled) {
		background: #e9ecef;
		border-color: #adb5bd;
	}
	
	.toolbar button.active {
		background: #0066cc;
		color: white;
		border-color: #0052a3;
	}
	
	.toolbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	
	.editor-wrapper {
		padding: 1rem;
	}
	
	:global(.tiptap-content) {
		outline: none;
		min-height: 300px;
	}
	
	/* Tiptap content styles */
	:global(.tiptap-content p) {
		margin: 0 0 1rem 0;
	}
	
	:global(.tiptap-content h1) {
		font-size: 2rem;
		font-weight: 700;
		margin: 1.5rem 0 1rem 0;
		line-height: 1.2;
	}
	
	:global(.tiptap-content h2) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 1.25rem 0 0.875rem 0;
		line-height: 1.3;
	}
	
	:global(.tiptap-content h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1rem 0 0.75rem 0;
		line-height: 1.4;
	}
	
	:global(.tiptap-content h4) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1rem 0 0.75rem 0;
	}
	
	:global(.tiptap-content h5) {
		font-size: 1rem;
		font-weight: 600;
		margin: 1rem 0 0.75rem 0;
	}
	
	:global(.tiptap-content h6) {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 1rem 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	:global(.tiptap-content ul),
	:global(.tiptap-content ol) {
		padding-left: 1.5rem;
		margin: 0 0 1rem 0;
	}
	
	:global(.tiptap-content li) {
		margin: 0.25rem 0;
	}
	
	:global(.tiptap-content code) {
		background: #f1f3f5;
		padding: 0.125rem 0.25rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875em;
		color: #e83e8c;
	}
	
	:global(.tiptap-content pre) {
		background: #282c34;
		color: #abb2bf;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		margin: 0 0 1rem 0;
	}
	
	:global(.tiptap-content pre code) {
		background: none;
		padding: 0;
		color: inherit;
		font-size: 0.875rem;
		line-height: 1.6;
	}
	
	:global(.tiptap-content blockquote) {
		border-left: 4px solid #0066cc;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #666;
		font-style: italic;
	}
	
	:global(.tiptap-content hr) {
		border: none;
		border-top: 2px solid #e0e0e0;
		margin: 2rem 0;
	}
	
	:global(.tiptap-content strong) {
		font-weight: 700;
	}
	
	:global(.tiptap-content em) {
		font-style: italic;
	}
	
	:global(.tiptap-content a),
	:global(.tiptap-content .editor-link) {
		color: #0066cc;
		text-decoration: underline;
		cursor: pointer;
	}
	
	:global(.tiptap-content a:hover),
	:global(.tiptap-content .editor-link:hover) {
		color: #0052a3;
	}
	
	/* Placeholder */
	:global(.tiptap-content p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		color: #adb5bd;
		pointer-events: none;
		height: 0;
		float: left;
	}
	
	/* Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	
	.modal-content {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15);
	}
	
	.modal-content h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #333;
	}
	
	.modal-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-field label {
		font-weight: 600;
		font-size: 0.875rem;
		color: #333;
	}
	
	.form-field input {
		padding: 0.625rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
	}
	
	.form-field input:focus {
		outline: none;
		border-color: #0066cc;
	}
	
	.field-hint {
		font-size: 0.75rem;
		color: #666;
	}
	
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}
	
	.modal-actions button {
		padding: 0.5rem 1.25rem;
		border: none;
		border-radius: 4px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-cancel {
		background: white;
		color: #333;
		border: 1px solid #ccc;
	}
	
	.btn-cancel:hover {
		background: #f5f5f5;
		border-color: #999;
	}
	
	.btn-primary {
		background: #0066cc;
		color: white;
	}
	
	.btn-primary:hover {
		background: #0052a3;
	}
</style>
