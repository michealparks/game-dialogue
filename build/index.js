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
function children(element) {
    return Array.from(element.childNodes);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
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
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
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
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

const fillVariables = (obj, vars) => {
  const varkeys = Object.keys(vars);

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      fillVariables(value, vars);
    } else if (Array.isArray(value)) {
      for (const varKey of varkeys) {
        const i = value.indexOf(varKey);
        if (i !== -1) {
          obj[key].splice(i, 1);
          obj[key] = [...obj[key], ...vars[varKey]];
        }
      }
    } else {
      const i = varkeys.indexOf(value);
      if (i !== -1) {
        obj[key] = [...vars[varkeys[i]]];
      }
    }
  }
};

const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
};

const main = async (chatWidget) => {
  let missedInput = '';
  let inputs = {};
  let inputPromiseResolve;
  let textItems = [];

  const response = await window.fetch('./dialogue.json');
  const config = await response.json();
  const debugJumpTo = window.location.hash.slice(1);
  const { bot, dialogue } = config;

  fillVariables(dialogue, config.variables);

  const startInputLoop = async () => {
    while (textItems.length > 0) {
      await textItem(textItems.shift());
    }
  };

  /**
   * Promisify setTimeout. Sleeps for n seconds.
   * @param {number} seconds
   * @returns {Promise}
   */
  const sleep = (seconds) => {
    if (seconds === 0) return Promise.resolve()

    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    })
  };

  /**
   * Sets up a new promise that will resolve
   * when user input is submitted
   * @returns {Promise}
   */
  const listenForInput = () => {
    if (missedInput) {
      return Promise.resolve(missedInput)
    }

    return new Promise((resolve) => {
      inputPromiseResolve = resolve;
    })
  };

  const jumpToTextItem = (key) => {
    let index;

    if (key[0] === '$') {
      key = key.slice(1);

      index = dialogue.findIndex((item) => {
        const acceptedVals = item[key];
        const inputval = inputs[key];
        return acceptedVals && acceptedVals.includes(inputval)
      });
    } else {
      index = dialogue.findIndex((item) => item.key === key);
    }

    if (index > 0) {
      return clone(dialogue).slice(index)
    }

    return clone(dialogue)
  };

  /**
   * Handles a single text item within the dialogue
   * @param {Object} item
   */
  const textItem = async (item) => {
    const {
      text,
      image,
      info = false,
      sleepBefore = bot.sleepBefore,
      sleepAfter = bot.sleepAfter,
      saveInputAs,
      saveVariable,
      waitFor = [],
      conditionals = [],
      waitForAnyInput = false,
      defaultResponses = bot.responses.incorrect,
      goto
    } = item;

    if (text || image) {
      chatWidget.startMessage({ info, user: false });
    }

    await sleep(sleepBefore);

    if (text) {
      let modifiedText = text;

      for (const [key, value] of Object.entries(inputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value);
      }

      chatWidget.commitMessage(modifiedText);
    }

    if (image) {
      chatWidget.commitImage(image);
    }

    if (saveInputAs) {
      inputs[saveInputAs] = await listenForInput();
    }

    if (waitForAnyInput) {
      await listenForInput();
    }

    if (saveVariable) {
      inputs = { ...inputs, ...saveVariable };
    }

    while (waitFor.length > 0) {
      let match;

      const input = await listenForInput();

      for (const child of waitFor) {
        if (match) break

        for (const acceptedInput of child.acceptedInputs) {
          const sanitized = input.replace(/\s\s+/g, ' ').toLowerCase();

          if (sanitized.includes(acceptedInput.toLowerCase())) {
            match = child;

            if (match.continue !== true) {
              waitFor.splice(waitFor.indexOf(child), 1);
            }

            if (child.saveInputAs) {
              inputs[child.saveInputAs] = input.toLowerCase();
              delete child.saveInputAs;
            }

            break
          }
        }
      }

      if (match) {
        await textItem(match);

        if (match.break) break
      } else {
        const rand = Math.random() * defaultResponses.length | 0;
        await textItem(defaultResponses[rand]);
      }
    }

    for (const conditional of conditionals) {
      const { variableEquals } = conditional;
      const [key, val] = variableEquals;

      if (inputs[key] === val) {
        await textItem(conditional);
        break
      }
    }

    await sleep(sleepAfter);

    if (goto) {
      textItems = jumpToTextItem(goto);
      return true
    }

    return false
  };

  chatWidget.addEventListener('userinput', (e) => {
    if (inputPromiseResolve) {
      inputPromiseResolve(e.detail);
    } else {
      missedInput += ` ${e.detail}`;
    }
  });

  if (debugJumpTo) {
    textItems = jumpToTextItem(debugJumpTo);
  } else {
    textItems = cloneDialogue();
  }

  startInputLoop();
};

/* src\index.svelte generated by Svelte v3.22.2 */

function create_fragment(ctx) {
	let t;
	let chat_widget;

	return {
		c() {
			t = space();
			chat_widget = element("chat-widget");
			document.title = "Koschei Society";
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, chat_widget, anchor);
			/*chat_widget_binding*/ ctx[1](chat_widget);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(chat_widget);
			/*chat_widget_binding*/ ctx[1](null);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let chatWidget;

	onMount(() => {
		main(chatWidget);
	});

	function chat_widget_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(0, chatWidget = $$value);
		});
	}

	return [chatWidget, chat_widget_binding];
}

class Src extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export default Src;
//# sourceMappingURL=index.js.map
