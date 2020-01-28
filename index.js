const chatWidget = (config) => {
  const listeners = [];

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const widget = document.createElement('chat-widget');

  widget.innerHTML = `
    <messages-box></messages-box>
    <input-box>
      <input type="text" placeholder="Send a message">
      <button>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </input-box>
  `;

  config.root.appendChild(widget);

  const messagesBox = document.querySelector('messages-box');
  const input = document.querySelector('input-box input');
  const button = document.querySelector('input-box button');

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserSubmit();
  }, { passive: true });

  button.addEventListener('click', (e) => {
    handleUserSubmit();
    input.focus();
  }, { passive: true });

  messagesBox.addEventListener('pointerdown', (e) => {
    input.blur();
  });
  
  const handleUserSubmit = () => {
    if (input.value === '') return

    const text = input.value;

    insertMessage({
      text,
      align: 'right',
    });

    for (const fn of listeners) {
      fn(text);
    }

    input.value = '';
  };

  const onUserInput = (callback) => {
    listeners.push(callback);
  };

  const insertMessage = ({
    text = '',
    align = 'left'
  }) => {
    const messageBubble = document.createElement('message-bubble');

    messageBubble.classList.toggle('left', align === 'left');
    messageBubble.classList.toggle('right', align === 'right');

    messageBubble.innerHTML = `
      <message-bubble-text>
        ${text}
      </message-bubble-text>
      <message-bubble-timestamp>
        ${dateFormatter.format(new Date())}
      </message-bubble-timestamp>
    `;

    messagesBox.appendChild(messageBubble);

    messageBubble.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    onUserInput,
    insertMessage
  }
};

// import smoothscroll from 'smoothscroll-polyfill'

// @TODO move inputs onto a stack, sleeping could disrupt them
const main = async () => {
  // smoothscroll.polyfill()

  const inputs = {};

  let modifiedText = '';
  let inputPromiseResolve;

  const response = await window.fetch('./dialogue.json');
  const config = await response.json();

  const {
    textItems = [],
    defaultSleepFor = 2,
    variables
  } = config;

  /**
   * @param {number} seconds
   * @returns {Promise}
   */
  const sleep = (seconds) => {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    })
  };

  const listenForInput = () => {
    return new Promise((resolve) => {
      inputPromiseResolve = resolve;
    })
  };

  const textItem = async (item) => {
    const {
      text,
      sleepFor = defaultSleepFor,
      sleepBefore,
      saveInputAs,
      waitFor = [],
      waitForAnyInput = false,
      defaultResponses = config.defaultResponses
    } = item;

    if (sleepBefore) {
      await sleep(sleepBefore);
    }

    modifiedText = text;

    if (modifiedText) {
      for (const [key, value] of Object.entries(inputs)) {
        modifiedText = modifiedText.replace(`{${key}}`, value);
      }

      chat.insertMessage({ text: modifiedText });
    }

    if (saveInputAs) {
      inputs[saveInputAs] = await listenForInput();
    }

    while (waitFor.length > 0) {
      const input = await listenForInput();

      let match;

      for (const child of waitFor) {
        let accepted = child.acceptedInputs;

        for (const [key, value] of Object.entries(variables)) {
          if (accepted.includes(key)) {
            accepted.splice(accepted.indexOf(key), 1);
            accepted = [...accepted, ...value];
          }
        }

        for (const str of accepted) {
          if (input.toLowerCase().includes(str.toLowerCase())) {
            match = child;
            waitFor.splice(waitFor.indexOf(child), 1);
            break
          }
        }
      }

      if (match) {
        await textItem(match);
      } else {
        const rand = Math.random() * defaultResponses.length | 0;
        await textItem(defaultResponses[rand]);
      }
    }

    if (waitForAnyInput) {
      await listenForInput();
    }

    await sleep(sleepFor);
  };

  document.head.querySelector('title').textContent = 'Koschei Society';

  const chat = chatWidget({
    root: document.body
  });

  chat.onUserInput((text) => {
    if (inputPromiseResolve) {
      inputPromiseResolve(text);
    }
  });

  for (const item of textItems) {
    await textItem(item);
  }
};

main();
