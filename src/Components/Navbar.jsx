import { Bot, Loader2, Search, SendHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  assistantModeLabel,
  getFarmAssistantReply,
} from "../Hooks/useFarmAssistant";

const Navbar = ({
  onSearchCity,
  onUseCurrentLocation,
  onRemoveRecentCity,
  onClearRecentCities,
  recentCities = [],
  isSearching,
  weatherData,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [chatInput, setChatInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const chatInputRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Ask me anything about farming decisions from your current weather data.",
    },
  ]);

  const quickPrompts = [
    "Should I water my plants today?",
    "Should I go out with an umbrella?",
    "Is it safe to spray fertilizer now?",
    "Best time today for farm work?",
    "Can I transplant seedlings this evening?",
    "Should I postpone pesticide spraying today?",
    "Is humidity too high for tomato leaves?",
    "How risky is fungal growth today?",
    "Do I need shade nets this afternoon?",
    "Can I dry harvested maize outside today?",
    "Should I irrigate once or twice today?",
    "What is my safest farm task right now?",
  ];

  const normalizedInput = searchInput.trim().toLowerCase();
  const citySuggestions = normalizedInput
    ? recentCities.filter((city) =>
        city.toLowerCase().includes(normalizedInput),
      )
    : recentCities;

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchInput, isInputFocused]);

  const submitSearch = (city) => {
    const cleanCity = city.trim();
    if (!cleanCity) return false;
    onSearchCity(cleanCity);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const didSubmit = submitSearch(searchInput);
    if (didSubmit) {
      setSearchInput("");
      setActiveSuggestionIndex(-1);
    }
    setIsInputFocused(false);
  };

  const handleUseCurrentLocation = () => {
    setSearchInput("");
    setIsInputFocused(false);
    onUseCurrentLocation();
  };

  const handleSuggestionSelect = (city) => {
    const didSubmit = submitSearch(city);
    if (didSubmit) {
      setSearchInput("");
      setActiveSuggestionIndex(-1);
    }
    setIsInputFocused(false);
  };

  const handleClearInput = () => {
    setSearchInput("");
    setActiveSuggestionIndex(-1);
  };

  const sendAssistantMessage = async (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isReplying) return;

    setChatMessages((prev) => [...prev, { role: "user", text: cleanQuestion }]);
    setChatInput("");
    setIsReplying(true);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
    }

    const reply = await getFarmAssistantReply({
      question: cleanQuestion,
      weatherData,
    });

    setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    setIsReplying(false);
  };

  const autoResizeChatInput = (element) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
    autoResizeChatInput(e.target);
  };

  const handleChatInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isReplying) {
        sendAssistantMessage(chatInput);
      }
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    await sendAssistantMessage(chatInput);
  };

  const handleInputKeyDown = (e) => {
    if (!isInputFocused || citySuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < citySuggestions.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : citySuggestions.length - 1,
      );
      return;
    }

    if (e.key === "Escape") {
      setIsInputFocused(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(citySuggestions[activeSuggestionIndex]);
      return;
    }

    if (e.key === "Tab" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(citySuggestions[activeSuggestionIndex]);
    }
  };

  useEffect(() => {
    if (!isAssistantOpen) return;
    if (!chatInputRef.current) return;

    const frame = requestAnimationFrame(() => {
      chatInputRef.current?.focus();
      autoResizeChatInput(chatInputRef.current);
    });

    return () => cancelAnimationFrame(frame);
  }, [isAssistantOpen]);

  return (
    <div>
      <div
        className={`fixed inset-0 z-120 transition-all duration-300 ease-out ${
          isAssistantOpen
            ? "pointer-events-auto bg-slate-950/95 opacity-100 backdrop-blur-xl"
            : "pointer-events-none bg-slate-950/0 opacity-0"
        }`}
      >
        <div
          className={`relative flex h-full w-full flex-col overflow-hidden transition-transform duration-300 ease-out ${
            isAssistantOpen ? "translate-y-0" : "translate-y-5"
          }`}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                Wither Farm Assistant
              </p>
              <p className="text-[11px] text-white/60">
                Advice from your current weather data
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-2 py-1 text-[10px] uppercase tracking-normal text-emerald-200">
              {assistantModeLabel}
            </span>
            <button
              type="button"
              onClick={() => setIsAssistantOpen(false)}
              className="text-white/70 hover:text-white"
              aria-label="Close assistant"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-24 overflow-y-auto border-b border-white/10 p-3 no-scrollbar sm:max-h-28">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendAssistantMessage(prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 space-y-2">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`w-fit max-w-[85%] wrap-break-word whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-cyan-500/30 border border-cyan-300/20 text-white"
                    : "mr-auto bg-white/10 border border-white/10 text-white/90"
                }`}
              >
                {message.text}
              </div>
            ))}
            {isReplying && (
              <div className="mr-auto w-fit rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/70 flex items-center gap-2">
                <Loader2 className="animate-spin" size={14} />
                Thinking...
              </div>
            )}
          </div>

          <form
            onSubmit={handleChatSubmit}
            className="flex gap-2 border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-3"
          >
            <textarea
              ref={chatInputRef}
              value={chatInput}
              rows={1}
              onChange={handleChatInputChange}
              onKeyDown={handleChatInputKeyDown}
              placeholder="Ask: should I wet my plants today?"
              className="max-h-40 flex-1 resize-none overflow-y-auto rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none"
            />
            <button
              type="submit"
              disabled={isReplying}
              className="self-end rounded-lg border border-cyan-300/30 bg-cyan-500/25 px-3 py-2 text-cyan-100 disabled:opacity-50"
              aria-label="Send message"
            >
              <SendHorizontal size={16} />
            </button>
          </form>
        </div>
      </div>
      <div className="fixed bottom-0 mx-auto w-full p-4">
        {isInputFocused && citySuggestions.length > 0 && (
          <div className="mb-2 mx-auto max-w-172.5 rounded-xl border border-white/10 bg-black/35 backdrop-blur-xl p-2">
            <div className="px-2 py-1 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/55">
                Recent Cities
              </p>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClearRecentCities}
                className="text-[10px] uppercase tracking-[0.15em] text-white/60 hover:text-red-300"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 px-2 pb-2">
              {citySuggestions.map((city, index) => (
                <div
                  key={city}
                  className={`rounded-full border px-2 py-1 text-xs flex items-center gap-1.5 ${
                    activeSuggestionIndex === index
                      ? "border-cyan-300/60 bg-white/25 text-white"
                      : "border-white/15 bg-white/10 text-white/90"
                  }`}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionSelect(city)}
                    className="px-1 hover:text-white"
                  >
                    {city}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onRemoveRecentCity(city)}
                    className="text-white/60 hover:text-red-300"
                    aria-label={`Remove ${city} from recent searches`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-172.5 backdrop-blur-2xl bg-white/10 border border-white/10 overflow-hidden p-4 rounded-xl flex items-center gap-3"
        >
          <button
            type="submit"
            className="text-white cursor-pointer"
            aria-label="Search city"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="text-white animate-spin" />
            ) : (
              <Search className="text-white" />
            )}
          </button>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Search city..."
            className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-white/50 outline-none"
          />
          {searchInput.trim() && (
            <button
              type="button"
              onClick={handleClearInput}
              className="text-white/65 hover:text-white"
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer text-red-400 hover:text-white"
          >
            GPS
          </button>
          <Bot
            onClick={() => setIsAssistantOpen(true)}
            className="text-white cursor-pointer"
          />
        </form>
      </div>
    </div>
  );
};

export default Navbar;
