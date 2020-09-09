function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    };
}

/**
  * Promisify setTimeout. Sleeps for n seconds.
  * @param {number} seconds
  * @returns {Promise}
  */

/**
 * Returns a human readable date.
 * @param {string} datetime
 */
const formatDatetime = (datetime) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(datetime)
  } catch (err) {
    return ''
  }
};

/* src\ChatWidget.svelte generated by Svelte v3.24.1 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	child_ctx[19] = i;
	return child_ctx;
}

// (84:4) {#each messages as message, i (i)}
function create_each_block(key_1, ctx) {
	let message_bubble;
	let message_text;
	let raw_value = /*message*/ ctx[17].value + "";
	let t0;
	let datetime_stamp;
	let t1_value = formatDatetime(/*message*/ ctx[17].datetime) + "";
	let t1;
	let handleMessageMount_action;
	let mounted;
	let dispose;

	return {
		key: key_1,
		first: null,
		c() {
			message_bubble = element("message-bubble");
			message_text = element("message-text");
			t0 = space();
			datetime_stamp = element("datetime-stamp");
			t1 = text(t1_value);
			toggle_class(message_text, "info", /*message*/ ctx[17].info);
			toggle_class(message_text, "user", /*message*/ ctx[17].user);
			toggle_class(datetime_stamp, "info", /*message*/ ctx[17].info);
			toggle_class(message_bubble, "user", /*message*/ ctx[17].user);
			this.first = message_bubble;
		},
		m(target, anchor) {
			insert(target, message_bubble, anchor);
			append(message_bubble, message_text);
			message_text.innerHTML = raw_value;
			append(message_bubble, t0);
			append(message_bubble, datetime_stamp);
			append(datetime_stamp, t1);

			if (!mounted) {
				dispose = action_destroyer(handleMessageMount_action = /*handleMessageMount*/ ctx[7].call(null, message_bubble));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*messages*/ 8 && raw_value !== (raw_value = /*message*/ ctx[17].value + "")) message_text.innerHTML = raw_value;
			if (dirty & /*messages*/ 8) {
				toggle_class(message_text, "info", /*message*/ ctx[17].info);
			}

			if (dirty & /*messages*/ 8) {
				toggle_class(message_text, "user", /*message*/ ctx[17].user);
			}

			if (dirty & /*messages*/ 8 && t1_value !== (t1_value = formatDatetime(/*message*/ ctx[17].datetime) + "")) set_data(t1, t1_value);

			if (dirty & /*messages*/ 8) {
				toggle_class(datetime_stamp, "info", /*message*/ ctx[17].info);
			}

			if (dirty & /*messages*/ 8) {
				toggle_class(message_bubble, "user", /*message*/ ctx[17].user);
			}
		},
		d(detaching) {
			if (detaching) detach(message_bubble);
			mounted = false;
			dispose();
		}
	};
}

// (95:4) {#if typing}
function create_if_block(ctx) {
	let message_bubble;
	let handleMessageMount_action;
	let mounted;
	let dispose;

	return {
		c() {
			message_bubble = element("message-bubble");

			message_bubble.innerHTML = `<message-text><message-dot></message-dot> 
          <message-dot></message-dot> 
          <message-dot></message-dot></message-text>`;
		},
		m(target, anchor) {
			insert(target, message_bubble, anchor);

			if (!mounted) {
				dispose = action_destroyer(handleMessageMount_action = /*handleMessageMount*/ ctx[7].call(null, message_bubble));
				mounted = true;
			}
		},
		d(detaching) {
			if (detaching) detach(message_bubble);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment(ctx) {
	let chat_widget_root;
	let chat_messages;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t0;
	let t1;
	let input_box;
	let input;
	let t2;
	let button;
	let mounted;
	let dispose;
	let each_value = /*messages*/ ctx[3];
	const get_key = ctx => /*i*/ ctx[19];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	let if_block = /*typing*/ ctx[4] && create_if_block(ctx);

	return {
		c() {
			chat_widget_root = element("chat-widget-root");
			chat_messages = element("chat-messages");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			if (if_block) if_block.c();
			t1 = space();
			input_box = element("input-box");
			input = element("input");
			t2 = space();
			button = element("button");
			button.innerHTML = `<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
			this.c = noop;
			attr(input, "type", "text");
			attr(input, "placeholder", "Send a message");
		},
		m(target, anchor) {
			insert(target, chat_widget_root, anchor);
			append(chat_widget_root, chat_messages);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(chat_messages, null);
			}

			append(chat_messages, t0);
			if (if_block) if_block.m(chat_messages, null);
			append(chat_widget_root, t1);
			append(chat_widget_root, input_box);
			append(input_box, input);
			/*input_binding*/ ctx[12](input);
			set_input_value(input, /*inputValue*/ ctx[2]);
			append(input_box, t2);
			append(input_box, button);
			/*chat_widget_root_binding*/ ctx[14](chat_widget_root);

			if (!mounted) {
				dispose = [
					listen(input, "input", /*input_input_handler*/ ctx[13]),
					listen(input, "keyup", /*handleKeyUp*/ ctx[5]),
					listen(button, "click", /*handleClick*/ ctx[6]),
					listen(chat_widget_root, "mousedown", function () {
						if (is_function(/*inputElement*/ ctx[1].blur)) /*inputElement*/ ctx[1].blur.apply(this, arguments);
					}),
					listen(chat_widget_root, "touchstart", function () {
						if (is_function(/*inputElement*/ ctx[1].blur)) /*inputElement*/ ctx[1].blur.apply(this, arguments);
					})
				];

				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			if (dirty & /*messages, formatDatetime*/ 8) {
				const each_value = /*messages*/ ctx[3];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, chat_messages, destroy_block, create_each_block, t0, get_each_context);
			}

			if (/*typing*/ ctx[4]) {
				if (if_block) ; else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(chat_messages, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*inputValue*/ 4 && input.value !== /*inputValue*/ ctx[2]) {
				set_input_value(input, /*inputValue*/ ctx[2]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(chat_widget_root);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (if_block) if_block.d();
			/*input_binding*/ ctx[12](null);
			/*chat_widget_root_binding*/ ctx[14](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let widgetElement;
	let inputElement;
	let inputValue = "";
	let messages = [];
	let typing = false;
	let pendingMessage = false;

	const startMessage = (config = {}) => {
		if (pendingMessage) {
			throw new Error("message already pending");
		}

		$$invalidate(4, typing = !config.user && !config.info);

		messages.push({
			value: "",
			datetime: Date.now(),
			...config
		});

		pendingMessage = true;
	};

	const cancelMessage = () => {
		messages.pop();
	};

	const commitMessage = value => {
		$$invalidate(3, messages[messages.length - 1].value = value, messages);
		$$invalidate(4, typing = false);
		pendingMessage = false;
		$$invalidate(3, messages);
	};

	const commitImage = imgsrc => {
		$$invalidate(3, messages[messages.length - 1].value = `<img src="${imgsrc}" />`, messages);
		$$invalidate(4, typing = false);
		$$invalidate(3, messages);
		pendingMessage = false;
	};

	const handleKeyUp = e => {
		if (e.key === "Enter") handleUserInput();
	};

	const handleClick = e => {
		inputElement.focus();
		handleUserInput();
	};

	const handleUserInput = () => {
		if (inputValue === "") return;
		startMessage({ user: true });
		commitMessage(inputValue);

		widgetElement.dispatchEvent(new CustomEvent("userinput",
		{
				bubbles: true,
				cancelable: true,
				composed: true,
				target: inputElement,
				detail: inputValue
			}));

		$$invalidate(2, inputValue = "");
	};

	const handleMessageMount = node => {
		node.scrollIntoView();
	};

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			inputElement = $$value;
			$$invalidate(1, inputElement);
		});
	}

	function input_input_handler() {
		inputValue = this.value;
		$$invalidate(2, inputValue);
	}

	function chat_widget_root_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			widgetElement = $$value;
			$$invalidate(0, widgetElement);
		});
	}

	return [
		widgetElement,
		inputElement,
		inputValue,
		messages,
		typing,
		handleKeyUp,
		handleClick,
		handleMessageMount,
		startMessage,
		cancelMessage,
		commitMessage,
		commitImage,
		input_binding,
		input_input_handler,
		chat_widget_root_binding
	];
}

class ChatWidget extends SvelteElement {
	constructor(options) {
		super();
		this.shadowRoot.innerHTML = `<style>*{--light-gray:#eee;--light-blue:rgba(79, 195, 247, 0.5);box-sizing:border-box;font-size:16px;font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"}:global(a){color:#00785A}chat-widget-root{overflow:hidden;position:absolute;display:block;height:100%;width:100%;background-color:var(--light-gray);margin:0}chat-messages{overflow-y:auto;position:absolute;width:100%;bottom:50px;max-height:calc(100vh - 50px);padding:15px}message-bubble{width:100%;transition:transform 0.3s, opacity 0.3s;transform-origin:0% 100%;animation:0.25s ease-out 0s 1 normal forwards running enter}@keyframes enter{from{opacity:0;transform:translate(0px, 8px) }to{opacity:1;transform:translate(0px, 0px) }}message-bubble{display:flex;flex-direction:column}message-bubble.user{align-items:flex-end;transform-origin:100% 100%}message-text{display:block;position:relative;width:fit-content;max-width:75%;padding:10px 15px;border-radius:4px;box-shadow:-9px 9px 30px 1px rgba(0,0,0,0.2)}message-text.info{padding-bottom:20px;box-shadow:none;color:#666}message-text.user{background-color:var(--light-blue);border-bottom-right-radius:0px}message-text:not(.user){background-color:var(--light-gray);border-bottom-left-radius:0px}message-bubble :global(img){width:100%;max-width:100%;border-radius:4px}message-text::after{position:absolute;bottom:0;content:'';width:0;height:0;border-style:solid}message-text.user::after{right:-8px;border-width:8px 0 0 8px;border-color:transparent transparent transparent var(--light-blue)}message-text:not(.user)::after{left:-8px;border-width:0 0 8px 8px;border-color:transparent transparent var(--light-gray) transparent}message-dot{display:inline-block;width:10px;height:10px;margin:2px 0;border-radius:100%;background-color:#aaa;animation:1s linear 0s infinite normal none running pulse}message-dot:nth-child(2){animation-delay:200ms}message-dot:nth-child(3){animation-delay:400ms}@keyframes pulse{0%{opacity:0.5}50%{opacity:1.0}100%{opacity:0.5}}datetime-stamp{display:block;padding:5px 15px 15px;font-size:12px}datetime-stamp.info{display:none}input-box{display:flex;position:absolute;bottom:0;left:0;width:100%;background-color:#fff}input{height:50px;width:calc(100% - 50px);padding:15px;margin:0;border:0;background-color:transparent;outline:none}button{display:grid;place-content:center;width:50px;padding:0;border:0;background:transparent;outline:0}svg{width:24px;height:24px;stroke:#555;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}</style>`;

		init(this, { target: this.shadowRoot }, instance, create_fragment, safe_not_equal, {
			startMessage: 8,
			cancelMessage: 9,
			commitMessage: 10,
			commitImage: 11
		});

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["startMessage", "cancelMessage", "commitMessage", "commitImage"];
	}

	get startMessage() {
		return this.$$.ctx[8];
	}

	get cancelMessage() {
		return this.$$.ctx[9];
	}

	get commitMessage() {
		return this.$$.ctx[10];
	}

	get commitImage() {
		return this.$$.ctx[11];
	}
}

customElements.define("chat-widget", ChatWidget);

export default ChatWidget;
//# sourceMappingURL=chat.js.map
