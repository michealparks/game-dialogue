
export const style = `
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
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
*:not(style) {
  display: block;
  box-sizing: border-box;
}
chat-bg {
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
`
