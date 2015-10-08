/*global MediumEditor*/
(function (window, document, undefined) {

	'use strict';

	function initEditor() {
		var editor = new MediumEditor('.editable', {
			buttonLabels: 'fontawesome'
		});

		var placeholder = document.querySelector('.toolbar-placeholder');
		var toolbar = document.querySelector('.medium-editor-toolbar');
		var toolbarClone;
		var title = document.querySelector('.splash h1');
		var hideTimer;

		function calculatePlaceholderPosition(animate) {
			var scaleFactor = window.innerWidth >= 768 ? 1.2 : 0.9;
			var scaledHeight = toolbar.offsetHeight * scaleFactor;

			toolbar.classList.add('placeholder');
			placeholder.style.height = scaledHeight + 'px';
			toolbar.style.top = placeholder.offsetTop + 'px';
			toolbar.style.left = ((window.innerWidth/2) - (toolbar.offsetWidth/2)) + 'px';

			if (!toolbarClone) {
				toolbarClone = toolbar.cloneNode(true);
				toolbarClone.id = '';
				toolbarClone.classList.add('toolbar-placeholder-clone');
				toolbarClone.classList.remove('fade-in');
			}

			toolbarClone.style.top = toolbar.style.top;
			toolbarClone.style.left = toolbar.style.left;
			toolbarClone.style.height = toolbar.style.height;

			placeholder.innerHTML = '';
			placeholder.appendChild(toolbarClone);

			if (animate) {
				toolbar.classList.add('fade-in');
			}
		}

		calculatePlaceholderPosition(true);

		editor.subscribe('showToolbar', function () {
			clearTimeout(hideTimer);
			toolbar.classList.remove('placeholder');
		});

		editor.subscribe('hideToolbar', function () {
			clearTimeout(hideTimer);

			hideTimer = setTimeout(function () {
				calculatePlaceholderPosition();
				toolbar.classList.add('placeholder');
			}, 300);
		})

		window.addEventListener('resize', calculatePlaceholderPosition);
	}

	function initThemes() {
		var linksContainer = document.getElementById('theme-links');
		var links = linksContainer.querySelectorAll('a');
		var items = document.querySelectorAll('.theme');
		var carousel = document.getElementById('theme-carousel');
		var currentIndex = 0;

		function calculateWidth() {
			var width = 0;

			[].forEach.call(
				items,
				function (item) {
					width += item.offsetWidth;
				}
			);

			carousel.style.width = width + 'px';
		}

		function handleClick(e) {
			e.preventDefault();
			linksContainer.querySelector('.active').classList.remove('active');
			this.classList.add('active');
			currentIndex = this.getAttribute('data-index') - 1;
			gotoCurrentTheme();
		};

		[].forEach.call(
			links,
			function (link) {
				link.addEventListener('click', handleClick);
			}
		);

		function gotoCurrentTheme() {
			var item = items[currentIndex];
			carousel.style.transform = 'translateX(-' + (item.offsetLeft - carousel.offsetLeft) + 'px)';
		}

		calculateWidth();

		function handleResize() {
			calculateWidth();
			gotoCurrentTheme();
		}

		window.addEventListener('resize', handleResize);
	}

	initEditor();
	initThemes();

	(function () {
		[].forEach.call(
			document.querySelectorAll('.copy'),
			function (el) {
				el.addEventListener('click', function (e) {
					e.preventDefault();
					this.classList.add('tooltipped');
					this.setAttribute('aria-label', 'Copied!');
				});

				el.addEventListener('mouseleave', function (e) {
					this.classList.remove('tooltipped');
				});
			}
		);
		var clipboard = new Clipboard('.copy');

		clipboard.on('success', function(e) {
	    console.info('Action:', e.action);
	    console.info('Text:', e.text);
	    console.info('Trigger:', e.trigger);

	    e.clearSelection();
		});

		clipboard.on('error', function(e) {
	    console.error('Action:', e.action);
	    console.error('Trigger:', e.trigger);
		});
	}());

}(window, document));
