import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function RuleInput() {
  const [messages, setMessages] = useState([]); // Chat history
  const [userInput, setUserInput] = useState(""); // Current user input
  const [loading, setLoading] = useState(false);
  const [clarifications, setClarifications] = useState([]); // Stores missing fields
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Stores user responses
  const chatContainerRef = useRef(null);

  // ✅ Auto-scroll chat history to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Handle user message (Handles both rule input & missing fields)
  const handleUserMessage = async () => {
    if (!userInput.trim()) return;

    // ✅ If clarifications are pending, process them first
    if (
      clarifications.length > 0 &&
      currentQuestionIndex < clarifications.length
    ) {
      const currentField = clarifications[currentQuestionIndex].field;
      const updatedAnswers = { ...userAnswers, [currentField]: userInput };

      setUserAnswers(updatedAnswers);
      setMessages((prev) => [...prev, { role: "user", content: userInput }]);
      setUserInput("");

      // ✅ Move to next missing input if exists
      if (currentQuestionIndex + 1 < clarifications.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: clarifications[currentQuestionIndex + 1].message,
          },
        ]);
      } else {
        // ✅ Finalize rule once all inputs are received
        finalizeRule(updatedAnswers);
      }
      return;
    }

    // ✅ New Rule Submission
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setUserInput("");

    try {
      const res = await axios.post("http://localhost:5000/process-rule", {
        user_input: userInput,
      });

      if (res.data.structured_rule) {
        const structuredRule = res.data.structured_rule;
        const missingFields = extractClarifications(structuredRule);

        if (missingFields.length > 0) {
          setClarifications(missingFields);
          setCurrentQuestionIndex(0);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "❌ Incomplete rule. AI needs more details.",
            },
            { role: "assistant", content: missingFields[0].message },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "✅ Rule saved successfully!" },
          ]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Server error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Extract Missing Fields for Clarifications
  const extractClarifications = (rule) => {
    let clarificationsNeeded = [];

    const checkAndExtract = (obj, parentKey = "") => {
      for (const key in obj) {
        const value = obj[key];

        if (typeof value === "string" && value.includes("[clarify")) {
          clarificationsNeeded.push({
            field: `${parentKey}${key}`,
            message: `❓ Please specify ${key.replace(/_/g, " ")}: ${value}`,
          });
        } else if (typeof value === "object" && value !== null) {
          checkAndExtract(value, `${parentKey}${key}.`);
        }
      }
    };

    checkAndExtract(rule.conditions);
    return clarificationsNeeded;
  };

  // ✅ Finalize Rule Once All Inputs Are Received
  const finalizeRule = async (updatedAnswers) => {
    let updatedRule = messages.find((msg) => msg.role === "assistant").content;

    // ✅ Replace placeholders with user responses
    const updateFields = (obj, parentKey = "") => {
      for (const key in obj) {
        const fullKey = `${parentKey}${key}`;
        if (updatedAnswers[fullKey]) {
          obj[key] = updatedAnswers[fullKey];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          updateFields(obj[key], `${fullKey}.`);
        }
      }
    };

    updateFields(updatedRule.conditions);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "✅ Rule finalized and saved!" },
    ]);
    setClarifications([]);
    setUserAnswers({});
  };

  return (
    <div className="p-5 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-3">AI Rule Input</h2>

      {/* ✅ Chat History */}
      <div
        className="border p-3 h-[500px] overflow-y-auto"
        ref={chatContainerRef}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded ${
              msg.role === "user" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <strong>{msg.role === "user" ? "You:" : "AI:"}</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      {/* ✅ Chat Input */}
      <div className="flex mt-3">
        <textarea
          className="border p-2 w-full rounded resize-y h-20"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && handleUserMessage()
          }
        ></textarea>
        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded"
          onClick={handleUserMessage}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
