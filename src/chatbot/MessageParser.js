class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    console.log("User message:", message);
    this.actionProvider.handleMessage(message);
  }
}

export default MessageParser;
