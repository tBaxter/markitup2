// ----------------------------------------------------------------------------
// A fork of markItUp! (Copyright (C) 2008 Jay Salvat/http://markitup.jaysalvat.com/)
// Modified to work without jQuery and use modern JS
// ----------------------------------------------------------------------------
function markItUp(selector, settings, extraSettings) {
    const element = document.querySelector(selector);

    function extend(target, ...sources) {
        for (const source of sources) {
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    function dropMenus(markupSet) {
        const ul = document.createElement('ul');
        let i = 0;

        markupSet.forEach((button) => {
            const li = document.createElement('li');
            const title = button.key ? `${button.name || ''} [Ctrl+${button.key}]` : button.name || '';

            if (button.separator) {
                li.className = 'markItUpSeparator';
                li.textContent = button.separator;
            } else {
                i++;
                let t = '';
                for (let j = levels.length - 1; j >= 0; j--) {
                    t += levels[j] + "-";
                }
                li.className = `markItUpButton markItUpButton${t}${i} ${button.className || ''}`;
                const a = document.createElement('a');
                a.href = '#';
                a.title = title;
                a.textContent = button.name || '';

                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    markup(button);
                });
                li.appendChild(a);

                if (button.dropMenu) {
                    levels.push(i);
                    li.classList.add('markItUpDropMenu');
                    li.appendChild(dropMenus(button.dropMenu));
                }
            }
            ul.appendChild(li);
        });
        levels.pop();
        return ul;
    }

    function init(element) {
        const id = element.id || '';
        const nameSpace = settings.nameSpace || '';
        const root = settings.root || '';

        element.classList.add('markItUpEditor');
        element.setAttribute('autocomplete', 'off');

        const container = document.createElement('div');
        container.className = 'markItUpContainer';
        element.parentNode.insertBefore(container, element);
        container.appendChild(element);

        const wrapper = document.createElement('div');
        wrapper.className = `markItUp ${nameSpace}`;
        wrapper.id = id ? `markItUp${id.charAt(0).toUpperCase()}${id.slice(1)}` : '';
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(container);

        const header = document.createElement('div');
        header.className = 'markItUpHeader';
        wrapper.insertBefore(header, container);

        header.appendChild(dropMenus(settings.markupSet));

        const footer = document.createElement('div');
        footer.className = 'markItUpFooter';
        wrapper.insertBefore(footer, null);

        if (settings.resizeHandle && !browser.safari) {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'markItUpResizeHandle';
            footer.appendChild(resizeHandle);

            let isResizing = false;
            let prevY = 0;

            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                prevY = e.clientY;
            });

            document.addEventListener('mousemove', (e) => {
                if (isResizing) {
                    const deltaY = e.clientY - prevY;
                    const newHeight = Math.max(20, element.clientHeight + deltaY);
                    element.style.height = `${newHeight}px`;
                    prevY = e.clientY;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        }

        element.addEventListener('keydown', keyPressed);
        element.addEventListener('keyup', keyPressed);
        element.addEventListener('insertion', (e) => {
            if (e.detail && e.detail.target !== false) {
                get(e);
            }
            if (textarea === markItUp.focused) {
                markup(e.detail);
            }
        });

        element.addEventListener('focus', () => {
            markItUp.focused = element;
        });

        if (settings.previewInElement) {
            refreshPreview();
        }
    }

    function keyPressed(e) {
        shiftKey = e.shiftKey;
        altKey = e.altKey;
        ctrlKey = !(e.altKey && e.ctrlKey) ? (e.ctrlKey || e.metaKey) : false;

        if (e.type === 'keydown') {
            if (ctrlKey === true) {
                const key = (e.keyCode == 13) ? '\\n' : String.fromCharCode(e.keyCode);
                const li = header.querySelector(`a[accesskey="${key}"]`).parentNode;
                if (li) {
                    ctrlKey = false;
                    setTimeout(() => {
                        li.dispatchEvent(new MouseEvent('mouseup'));
                    }, 1);
                    return false;
                }
            }
            if (e.keyCode === 13 || e.keyCode === 10) {
                if (ctrlKey === true) {
                    ctrlKey = false;
                    markup(settings.onCtrlEnter);
                    return settings.onCtrlEnter.keepDefault;
                } else if (shiftKey === true) {
                    shiftKey = false;
                    markup(settings.onShiftEnter);
                    return settings.onShiftEnter.keepDefault;
                } else {
                    markup(settings.onEnter);
                    return settings.onEnter.keepDefault;
                }
            }
            if (e.keyCode === 9) {
                if (shiftKey == true || ctrlKey == true || altKey == true) {
                    return false;
                }
                if (caretOffset !== -1) {
                    get(element);
                    caretOffset = element.value.length - caretOffset;
                    set(caretOffset, 0);
                    caretOffset = -1;
                    return false;
                } else {
                    markup(settings.onTab);
                    return settings.onTab.keepDefault;
                }
            }
        }
    }

    function markup(button) {
        hash = clicked = button;
        get(element);
        Object.keys(button).forEach((key) => {
            const val = button[key];
            //console.log('button keys', val)
            if (typeof val === 'function') {
                button[key] = val();
            }
        });
        if (caretOffset === -1) {
            // If caretOffset is 0 or -1, 
            // it means there is no specific position set for insertion in the textarea, 
            // or the textarea has no focus. 
            // The markup is inserted at the start of the caret position.
            const text = element.value;
            const start = element.selectionStart;
            const end = element.selectionEnd;
            const selected = text.substring(start, end);
            //console.log('caretOffset: ', caretOffset, 'text: ', text, 'start: ', start, 'end: ', end, 'selected: ', selected, 'button: ', button)
            if (button.replaceWith) {
                if (selected) {
                    const replacement = button.replaceWith;
                    const newText = text.substring(0, start) + replacement + text.substring(end);
                    element.value = newText;
                    element.selectionStart = start;
                    element.selectionEnd = start + replacement.length;
                }
            } else {
                // most buttons use openWith instead of replaceWith
                //console.log("we're using openwith")
                const startString = button.before || '';
                const endString = button.after || '';
                const newText = text.substring(0, start) + startString + selected + endString + text.substring(end);
                element.value = newText;
                element.selectionStart = start + startString.length;
                element.selectionEnd = start + startString.length + selected.length;
            }
            const range = document.createRange();
            range.setStart(element, element.selectionStart);
            range.setEnd(element, element.selectionStart);
            setRange(range);
        } else {
            //  if caretOffset is not -1,
            // there is a specific position set for insertion, 
            // and the markup should be inserted at that position.
            // This the case when there is text in place
            // console.log("caretoffset !== -1")
            const text = element.value;
            const replacement = button.openWith || button.placeHolder || '';
        
            const newText = text.substring(0, caretOffset) + replacement + text.substring(caretOffset);
            //console.log('text: ', text, 'replacement: ', replacement, 'button: ', button, 'newtext: ', newText)
            element.value = newText;
            set(caretOffset + replacement.length, 0);
        }

        if (button.callback) {
            button.callback();
        }
        if (button.className === 'markItUpPreview') {
            refreshPreview();
        }
        if (button.preview) {
            previewInWindow();
        }
        if (button.previewInElement) {
            refreshPreview();
        }
        if (button.resizeHandle) {
            const h = element.clientHeight;
            element.style.height = `${h}px`;
        }
    }

    function get(element) {
        scrollPosition = element.scrollTop;
        caretPosition = element.selectionStart;
        caretOffset = caretPosition;
        return true;
    }

    function set(start, length) {
        element.focus();
        element.setSelectionRange(start, start + length);
        element.scrollTop = scrollPosition;
    }

    function setRange(range) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function localize(data, inText) {
        if (inText) {
            return data.replace(/("|')~\//g, `$1${options.root}`);
        }
        return data.replace(/^~\//, options.root);
    }

    function remove() {
        header.remove();
        footer.remove();
        wrapper.remove();
        element.classList.remove('markItUpEditor');
        element.removeAttribute('autocomplete');
        element.removeEventListener('keydown', keyPressed);
        element.removeEventListener('keyup', keyPressed);
        element.removeEventListener('insertion', () => {});
        element.removeEventListener('focus', () => {});
    }

    const browser = (() => {
        const ua = navigator.userAgent.toLowerCase();
        const match = /(chrome)[ \/]([\w.]+)|(webkit)[ \/]([\w.]+)|(opera)(?:.*version|)[ \/]([\w.]+)|(msie) ([\w.]+)|mozilla(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

        const browsers = {
            chrome: false,
            webkit: false,
            safari: false,
            opera: false,
            msie: false,
            mozilla: false,
        };

        if (match[1]) {
            browsers.chrome = true;
            browsers.webkit = true;
        } else if (match[3]) {
            browsers.webkit = true;
            if (ua.match(/version\/([\w.]+)/)) {
                browsers.safari = true;
            }
        } else if (match[5]) {
            browsers.opera = true;
        } else if (match[7]) {
            browsers.msie = true;
        } else if (match[8]) {
            browsers.mozilla = true;
        }
        return browsers;
    })();

    const levels = [];

    init(element);
}

// Example usage:
/*
markItUp('.editor', {
    markupSet: [
        { name: 'Bold', key: 'B', openWith: '(!(<strong>|!|</strong>)!)' },
        { name: 'Italic', key: 'I', openWith: '(!(<em>|!|</em>)!)' },
        { name: 'Heading 1', key: '1', openWith: '\n<h1>', closeWith: '</h1>\n' },
        { separator: '---------------' },
        { name: 'Bulleted list', openWith: '\n<ul>\n', closeWith: '\n</ul>\n' },
        { name: 'Numeric list', openWith: '\n<ol>\n', closeWith: '\n</ol>\n' },
        { separator: '---------------' },
        { name: 'Picture', key: 'P', replaceWith: '<img src="[![Source:!:http://]!]" alt="[![Alt]!]" />' },
        { name: 'Link', key: 'L', openWith: '<a href="[![Link:!:http://]!]"(!( title="[![Title]!]")!)>', closeWith: '</a>', placeHolder: 'Your text to link...' }
    ],
    resizeHandle: true,
    previewInElement: true
});
*/
