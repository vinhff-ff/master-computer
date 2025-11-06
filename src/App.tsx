import React, { useState } from "react";
import { evaluate } from "mathjs";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"NORMAL" | "AI">("NORMAL");

  const calculateNormal = () => {
    if (!input.trim()) {
      setInput("Vui lòng nhập phép tính!");
      return;
    }
    try {
      const result = evaluate(input);
      setInput(String(result));
    } catch {
      setInput("Ôi không lỗi rồi! Phải chịu!");
    }
  };





  const calculateWithAI = async () => {
    if (!input.trim()) {
      setInput("Vui lòng nhập phép tính!");
      return;
    }

    try {
      setInput("Đợi thầy...");
      const model = "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyAtY_akamZyUNSV2CqCCsj2xjq1av58kyA`;

      const body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: 'Bạn là một máy tính toán và chỉ trả lời bằng đáp án cuối cùng. Không giải thích, không thêm câu dẫn hoặc bất kỳ văn bản nào khác ngoài kết quả tính toán' + input }
            ]
          }
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.error) {
        setInput("Ôi không lỗi rồi! Phải chịu!");
      } else {
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả";
        setInput(resultText);
      }
    } catch (err) {
      console.error(err);
      setInput("Ôi không lỗi rồi! Phải chịu!");
    }
  };








  const handleEqual = () => {
    if (mode === "AI") {
      calculateWithAI();
    } else {
      calculateNormal();
    }
  };




  const handleClick = (value: string) => {
    setInput((prev) => prev + value);
  };




  const handleClear = () => setInput("");



  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "=", "+"
  ];




  return (
    <div>
      <h1 style={{ display: "flex", justifyContent: "center", color: 'white' }}>
        SmartCalculator
      </h1>

      <div className="calculator">
        <div className="mode-switch">
          <button
            className={mode === "NORMAL" ? "active" : ""}
            onClick={() => setMode("NORMAL")}
          >
            Bình thường
          </button>
          <button
            className={mode === "AI" ? "active" : ""}
            onClick={() => setMode("AI")}
          >
            AI
          </button>
        </div>

        <input
          className="display"
          value={input}
          onChange={(e) => mode === "AI" && setInput(e.target.value)}
          readOnly={mode === "NORMAL"}
          placeholder={
            mode === "AI"
              ? "Chế độ AI"
              : ""
          }
        />

        <div className="buttons">
          {buttons.map((btn) =>
            btn === "=" ? (
              <button key={btn} onClick={handleEqual} className="equal">
                {btn}
              </button>
            ) : (
              <button key={btn} onClick={() => handleClick(btn)}>
                {btn}
              </button>
            )
          )}
        </div>

        <button className="clear" onClick={handleClear}>
          XOÁ HẾT
        </button>
      </div>
    </div>
  );
}
