const style = `
* {
  --light-gray: #eee;
  --light-blue: rgba(79, 195, 247, 0.5);
  --dot-size: 10px;
}
:root {
  overflow: hidden;
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0;
}
* {
  box-sizing: border-box;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
chat-bg {
  display: block;
  height: 100%;
  width: 100%;
  background-color: var(--light-gray);
}
messages-box {
  overflow-y: auto;
  position: absolute;
  width: 100%;
  bottom: 50px;
  max-height: calc(100vh - 50px);
  padding: 15px;
}
input-box {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
}
input-box input {
  height: 50px;
  width: calc(100% - 50px);
  padding: 15px;
  margin: 0;
  border: 0;
  background-color: transparent;
  outline: none;
}
input-box button {
  display: flex;
  justify-content: center;
  width: 50px;
  padding: 0;
  border: 0;
  background: transparent;
  outline: 0;
}
message-bubble {
  width: 100%;
  transition: transform 0.3s, opacity 0.3s;
  transform-origin: 0% 100%;
  opacity: 1;
  transform: scale(1.0);
}
message-bubble.entering {
  opacity: 0;
  transform: scale(0.7);
}
message-bubble.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transform-origin: 100% 100%;
}
message-text {
  display: block;
  position: relative;
  width: fit-content;
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 4px;
  box-shadow: -9px 9px 30px 1px rgba(0,0,0,0.2);
}
message-bubble.image message-text,
message-bubble img {
  width: 100%;
  max-width: 100%;
  border-radius: 4px;
}
message-text:after {
  position: absolute;
  bottom: 0;
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
}
message-bubble.left message-text {
  background-color: var(--light-gray);
  border-bottom-left-radius: 0px;
}
message-bubble.right message-text {
  background-color: var(--light-blue);
  border-bottom-right-radius: 0px;
}
message-bubble.left message-text:after {
  left: -8px;
  border-width: 0 0 8px 8px;
  border-color: transparent transparent var(--light-gray) transparent;
}
message-bubble.right message-text:after {
  right: -8px;
  border-width: 8px 0 0 8px;
  border-color: transparent transparent transparent var(--light-blue);
}
message-timestamp {
  display: block;
  padding: 5px 15px 15px;
  font-size: 12px;
}
.dot {
  display: inline-block;
  width: var(--dot-size);
  height: var(--dot-size);
  margin: 2px 0;
  border-radius: 100%;
  background-color: #aaa;
  animation-name: pulse;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
.dot:nth-child(2) { animation-delay: 200ms; }
.dot:nth-child(3) { animation-delay: 400ms; }
@keyframes pulse {
  0%  { opacity: 0.5;  }
  50% { opacity: 1.0;  }
  100% { opacity: 0.5; }
}
`;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  dateStyle: 'short',
  timeStyle: 'short'
});

window.customElements.define('chat-widget', class ChatWidget extends HTMLElement {
  constructor (props) {
    super(props);
  
    this.listeners = [];
    this.pendingMessages = { remote: undefined, user: undefined };
    this.root = this.attachShadow({ mode: 'open' });
    this.root.innerHTML = `
      <style>${style}</style>
      <chat-bg>
        <messages-box></messages-box>
        <input-box>
          <input type="text" placeholder="Send a message">
          <button>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </input-box>
      </chat-bg>
    `;
  }

  connectedCallback () {
    this.messagesBox = this.root.querySelector('messages-box');
    this.input = this.root.querySelector('input-box input');
    this.button = this.root.querySelector('input-box button');

    const handleUserSubmit = () => {
      if (this.input.value === '') return

      const text = this.input.value;

      this.startMessage({ origin: 'user' });
      this.commitMessage({ text, origin: 'user' });

      for (const fn of this.listeners) {
        fn(text);
      }

      this.input.value = '';
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleUserSubmit();
    };

    this.input.addEventListener('keydown', handleKeyDown, { passive: true });

    this.messagesBox.addEventListener('mousedown', this.input.blur, { passive: true });
    this.messagesBox.addEventListener('touchstart', this.input.blur, { passive: true });

    this.button.addEventListener('click', (e) => {
      handleUserSubmit();
      this.input.focus();
    }, { passive: true });
  }

  /**
   * Listen for when a user submits a message
   * @param {Function} callback
   */
  onUserInput (callback) {
    this.listeners.push(callback);
  }

  /**
   * Trigger the start of a new message
   * @param {Object} props
   */
  startMessage ({ origin = 'remote' }) {
    const message = document.createElement('message-bubble');
    message.classList.add('empty', 'entering');
    message.classList.add(origin === 'remote' ? 'left' : 'right');

    message.innerHTML = `
      <message-text>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </message-text>
      <message-timestamp></message-timestamp>
    `;

    this.pendingMessages[origin] = message;

    this.messagesBox.appendChild(message);
    message.scrollIntoView();
    setTimeout(() => message.classList.remove('entering'), 100);
  }

  /**
   * Send the message to the screen
   * @param {Object} props
   */
  commitMessage ({ text = '', origin = 'remote' }) {
    const message = this.pendingMessages[origin];
    message.querySelector('message-text').innerHTML = text;
    message.querySelector('message-timestamp').textContent = dateFormatter.format(new Date());
    message.classList.remove('empty');
    message.scrollIntoView();
  }

  commitImage ({ image, origin = 'remote' }) {
    const message = this.pendingMessages[origin];
    message.classList.add('image');
    message.querySelector('message-text').innerHTML = `
      <img src="${image}" />
    `;
  }
});

/**
 * @TODO move inputs onto a stack, sleeping could cause bot to miss them
 */
const main = async () => {
  let inputs = {};
  let inputPromiseResolve;
  let textItems = [];

  const response = await window.fetch('./dialogue.json');
  const config = await response.json();

  const {
    defaultSleepFor,
    defaultSleepBefore,
    variables
  } = config;

  const { parse, stringify } = JSON;

  const getTextItems = () => {
    return parse(stringify(config.textItems))
  };

  const fillVariables = () => {
    config.textItems = parse(stringify(config.textItems, (_, value) => {
      if (!Array.isArray(value)) return value

      for (const [varKey, varVal] of Object.entries(variables)) {
        if (value.includes(varKey)) {
          value.splice(value.indexOf(varKey), 1);
          value = [...value, ...varVal];
        }
      }

      return value
    }));
  };

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
    return new Promise((resolve) => {
      inputPromiseResolve = resolve;
    })
  };

  const jumpToTextItem = (key) => {
    let index;

    if (key[0] === '$') {
      key = key.slice(1);

      index = config.textItems.findIndex((item) => {
        const acceptedVals = item[key];
        const inputval = inputs[key];
        return acceptedVals && acceptedVals.includes(inputval)
      });
    } else {
      index = config.textItems.findIndex((item) => {
        return item.key === key
      });
    }

    if (index > 0) {
      console.log(getTextItems().slice(index));
      return getTextItems().slice(index)
    }

    return getTextItems()
  };

  /**
   * Handles a single text item within the dialogue
   * @param {Object} item
   */
  const textItem = async (item) => {
    const {
      text,
      image,
      sleepFor = defaultSleepFor,
      sleepBefore = defaultSleepBefore,
      saveInputAs,
      saveVariable,
      waitFor = [],
      conditionals = [],
      waitForAnyInput = false,
      defaultResponses = config.defaultResponses,
      goto
    } = item;

    if (text || image) {
      chat.startMessage({ origin: 'remote' });
    }

    await sleep(sleepBefore);

    if (text) {
      let modifiedText = text;

      for (const [key, value] of Object.entries(inputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value);
      }

      chat.commitMessage({ text: modifiedText });
    }

    if (image) {
      chat.commitImage({ image });
    }

    if (saveInputAs) {
      inputs[saveInputAs] = await listenForInput();
    }

    if (saveVariable) {
      inputs = { ...inputs, ...saveVariable };
    }

    while (waitFor.length > 0) {
      const input = await listenForInput();
      let match;

      for (const child of waitFor) {
        if (match) break

        for (const acceptedInput of child.acceptedInputs) {
          if (input.toLowerCase().includes(acceptedInput.toLowerCase())) {
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

    if (waitForAnyInput) {
      await listenForInput();
    }

    for (const conditional of conditionals) {
      const { variableEquals } = conditional;
      const [key, val] = variableEquals;

      if (inputs[key] === val) {
        await textItem(conditional);
        break
      }
    }

    await sleep(sleepFor);

    if (goto) {
      textItems = jumpToTextItem(goto);
      return true
    }

    return false
  };

  document.head.querySelector('title').textContent = 'Koschei Society';

  const chat = document.createElement('chat-widget');
  document.body.appendChild(chat);

  chat.onUserInput((text) => {
    if (inputPromiseResolve) {
      inputPromiseResolve(text);
    }
  });

  fillVariables();

  if (config.debugJumpTo) {
    textItems = jumpToTextItem(config.debugJumpTo);
  } else {
    textItems = getTextItems();
  }

  startInputLoop();
};

main();
