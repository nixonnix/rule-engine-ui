class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleMessage = async (message) => {
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      console.log("API Response:", data);

      // ✅ Extract the first key inside `responses[0]`
      const firstAgentKey = Object.keys(data.responses[0])[0]; // Gets 'rule_creator'
      const botResponse = data.responses[0][firstAgentKey].messages.content; // Extracts message content

      // ✅ Create bot message
      const botMessage = this.createChatBotMessage(botResponse);

      // ✅ Update chatbot state
      this.setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, botMessage],
      }));
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = this.createChatBotMessage(
        "Oops! There was an error connecting to the server."
      );
      this.setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, errorMessage],
      }));
    }
  };
}

export default ActionProvider;
