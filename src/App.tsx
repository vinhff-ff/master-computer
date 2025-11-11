import React, { useState } from "react";
import { evaluate } from "mathjs";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"NORMAL" | "AI">("NORMAL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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
    if (!input.trim() && !selectedFile) {
      setInput("Vui lòng nhập phép tính hoặc tải file!");
      return;
    }

    try {
      setInput("Đợi xíuuu...");
      const model = "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyBASlCyZo0o-RdbqDHnomSjkL-Ieo3OXYs`;

      const textPart = {
        text:
          "Bạn là một máy tính toán và chỉ trả lời bằng đáp án cuối cùng. " +
          "Không giải thích, không thêm câu dẫn. " +
          "Đây là yêu cầu của tôi: " +
          input,
      };

      const parts: any[] = [textPart];

      if (selectedFile) {
        const base64Data = await fileToBase64(selectedFile);
        parts.push({
          inlineData: {
            mimeType: selectedFile.type,
            data: base64Data,
          },
        });
      }

      const body = { contents: [{ role: "user", parts }] };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.error) {
        setInput("Chòi oyy lũi ròiiii!");
      } else {
        const resultText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả";
        setInput(resultText);
      }
    } catch (err) {
      console.error(err);
      setInput("Chòi oyy lũi ròiiii!");
    }
  };

  const handleEqual = () => {
    if (mode === "AI") calculateWithAI();
    else calculateNormal();
  };

  const handleClick = (value: string) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const buttons = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

  return (
    <div>
      <h1 style={{
        display: "flex",
        justifyContent: "center",
        color: "#f7c948",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
      }}>SmartCalculator</h1>

      <div className="calculator">
        <div className="mode-switch">
          <button
            className={mode === "NORMAL" ? "active" : ""}
            onClick={() => setMode("NORMAL")}
          >
            Thường
          </button>
          <button
            className={mode === "AI" ? "active" : ""}
            onClick={() => setMode("AI")}
          >
            AI
          </button>
        </div>

        <div
          className="input-wrapper"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            className="display"
            value={input}
            onChange={(e) => mode === "AI" && setInput(e.target.value)}
            readOnly={mode === "NORMAL"}
            placeholder={mode === "AI" ? "" : ""}
            style={{
              paddingLeft: selectedFile ? "90px" : "40px",
              paddingRight: "10px",
              display: "flex",
              alignItems: "center",
              transition: "padding 0.3s ease",
            }}
          />

          {mode === "AI" && (
            <>
              <label
                htmlFor="fileInput"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#555",
                  color: "white",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "20px",
                  boxShadow: "0px 2px #333, 0 8px 15px rgba(0, 0, 0, 0.3)",
                  border: "none",
                  transition: "0.2s",
                }}

              >
                <p style={{ marginTop: '15px' }}>+</p>
              </label>
              <input
                id="fileInput"
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
            </>
          )}

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                position: "absolute",
                left: "45px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "35px",
                width: "35px",
                borderRadius: "5px",
                objectFit: "cover",
              }}
            />
          ) : (
            selectedFile && (
              <span
                style={{
                  position: "absolute",
                  left: "45px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#28a745",
                  fontSize: "13px",
                  maxWidth: "35px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedFile.name}
              </span>
            )
          )}
        </div>

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
