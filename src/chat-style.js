
export const style = `
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

messages-box {
  overflow-y: auto;
  position: absolute;
  width: 100%;
  height: calc(100% - 50px);
  padding: 15px;
}

input-box {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #eee;
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

message-bubble.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

message-text {
  position: relative;
  width: fit-content;
  max-width: 75%;
  padding: 10px 15px;
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
  background-color: #eee;
  border-bottom-left-radius: 0px;
}

message-bubble.right message-text {
  background-color: #4FC3F7;
  border-bottom-right-radius: 0px;
}

message-bubble.left message-text:after {
  left: -8px;
  border-width: 0 0 8px 8px;
  border-color: transparent transparent #eee transparent;
}

message-bubble.right message-text:after {
  right: -8px;
  border-width: 8px 0 0 8px;
  border-color: transparent transparent transparent #4FC3F7;
}

message-timestamp {
  padding: 5px 15px 15px;
  font-size: 12px;
}
`
