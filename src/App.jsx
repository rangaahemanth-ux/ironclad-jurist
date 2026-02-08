import { useState, useRef, useEffect, useCallback } from "react";

const MODES = [
  { id: "research", label: "Research", icon: "🔬", prompt: "", search: false },
  { id: "project", label: "Project", icon: "📄", prompt: "Generate a comprehensive 30-50 page law project in Hyderabad format with TOC, Table of Cases, chapters, bibliography. Topic: ", search: false },
  { id: "moot", label: "Moot Court", icon: "⚔️", prompt: "Prepare moot court arguments for petitioner and respondent with judge questions and rebuttals. Topic: ", search: false },
  { id: "exam", label: "Exam Prep", icon: "📝", prompt: "Exam preparation with IRAC answers, key points, likely questions. Topic: ", search: false },
  { id: "latest", label: "Latest", icon: "📰", prompt: "Search for and analyze the latest judgments and developments on: ", search: true },
];

const JOKES = [
  "Why did the lawyer bring a ladder to court? The case was on another level! 😂",
  "Judge: 'I'll hold you in contempt!' Me: 'Get in line, my mom got there first.' 💀",
  "Law school is like riding a bike. Except the bike is on fire. The ground is on fire. Everything is on fire because you're in hell. 🔥",
  "My professor said 'ignorance of the law is no excuse.' So I dropped out. Checkmate. 😎",
  "Good lawyer knows the law. Great lawyer knows the judge. 🤝",
  "Law school motto: Sleep is for the acquitted. 😴⚖️",
  "Client: 'I want the truth!' Lawyer: 'You can't afford it. Billable hours.' 🧾",
  "My research method: Google → panic → SCC Online → panic more → cite anyway 📚",
  "Article 21 = Right to Life. My exam schedule violates it. Filing a PIL. 📝",
  "Professor: 'What's the ratio?' Me: 'Ratio of my tears to my GPA?' 😭",
  "Res Ipsa Loquitur = thing speaks for itself. My bank balance also speaks for itself. 📉",
  "Studying criminal law at 3am makes you feel like you're planning crimes 🕐",
  "Moot strategy: speak confidently, cite aggressively, pray internally 🗣️🙏",
  "AI helped my assignment then said 'verify on SCC Online.' Even AI doesn't trust itself! 🤖",
  "Judge: 'Anything to offer this court?' Lawyer: 'Chai and samosa, your honor?' ☕",
  "Only balance in my life = Scales of Justice. Work-life balance left the chat. ⚖️",
  "Pro tip: 'It depends' is always a valid legal answer ✅",
  "Due process? More like due stress 😓",
  "Sharks don't bite lawyers. Professional courtesy 🦈",
  "Told parents I want to be a lawyer. They said pick a side. I said whichever pays more 💰",
];

const PET_MSGS = [
  "Tan! Drink water NOW! 💧", "Eyes need rest! Look far for 20s! 👀", "Stretch! Stand up! 🧘‍♀️",
  "Eat a snack, not just stress! 🍪", "Sit up straight! 🪑", "Have you eaten?? 🍽️",
  "BLINK! Eyes drying! 👁️", "3 deep breaths now. 🌬️", "Take 5 min break! ⏰",
  "Roll your shoulders! 💆‍♀️", "WATER. NOW. 💧💧", "Great posture = great grades! 😤",
];

const STIT = ["PROVISION","RATIO DECIDENDI","INDIAN PRECEDENT","FOREIGN PRECEDENT","COMPARATIVE ANALYSIS","DEEP ANALYSIS","PRACTICAL APPLICATION","RECOMMENDED SOURCES","HINDI EXPLANATION"];
const SEC_COL = { PROVISION:"#5A9CD0","RATIO DECIDENDI":"#6AAAD4","INDIAN PRECEDENT":"#5098C0","FOREIGN PRECEDENT":"#48A088","COMPARATIVE ANALYSIS":"#6888C0","DEEP ANALYSIS":"#7098C8","PRACTICAL APPLICATION":"#8098B0","RECOMMENDED SOURCES":"#5890A8","HINDI EXPLANATION":"#A09060" };

function parseSections(t) {
  const p = new RegExp(`^(${STIT.join("|")})\\s*$`, "gm");
  const ms = []; let m;
  while ((m = p.exec(t)) !== null) ms.push({ title: m[1], si: m.index + m[0].length });
  if (!ms.length) return null;
  const s = [];
  for (let i = 0; i < ms.length; i++) {
    const e = i < ms.length - 1 ? ms[i + 1].si - ms[i + 1].title.length : t.length;
    const c = t.slice(ms[i].si, e).trim();
    if (c) s.push({ title: ms[i].title, content: c });
  }
  return s.length ? s : null;
}

function extractCases(t) {
  const p = /([A-Z][a-zA-Z\s.&']+(?:v\.?\s+|vs\.?\s+)[A-Z][a-zA-Z\s.&']+)/g;
  const cs = new Set(); let m;
  while ((m = p.exec(t)) !== null) { const n = m[1].trim(); if (n.length > 10 && n.length < 90) cs.add(n); }
  return [...cs];
}

function genTitle(t) { const w = t.trim().split(/\s+/).slice(0, 6).join(" "); return w.length > 40 ? w.slice(0, 40) + "..." : w; }

function generatePDF(content) {
  const w = window.open("", "_blank"); if (!w) return;
  const secs = parseSections(content), cases = extractCases(content);
  w.document.write(`<!DOCTYPE html><html><head><title>Legal Research</title><style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lora:wght@400;600&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cormorant Garamond',serif;color:#1a1a2e;padding:50px 60px;line-height:1.9;max-width:780px;margin:0 auto}h1{font-size:22px;text-align:center}h2{font-size:15px;font-weight:700;color:#2a4a6a;margin:24px 0 10px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #d0d8e0;padding-bottom:5px}p{font-family:'Lora',serif;font-size:13px;margin-bottom:10px;text-align:justify;line-height:1.9}.hd{text-align:center;margin-bottom:35px;padding-bottom:20px;border-bottom:2px solid #2a4a6a}.tc{margin:20px 0;padding:15px;background:#f8f9fb;border-radius:6px}.tc h3{font-size:13px;color:#2a4a6a;margin-bottom:6px}.ti{font-size:11px;color:#4a6a8a;padding:2px 0;font-style:italic}.ft{margin-top:40px;padding-top:12px;border-top:2px solid #2a4a6a;font-size:9px;color:#888;text-align:center}@media print{body{padding:30px 45px}}</style></head><body>`);
  w.document.write(`<div class="hd"><h1>The Ironclad Jurist</h1><p style="font-size:11px;color:#666;letter-spacing:2px">LEGAL RESEARCH</p><p style="font-size:10px;color:#888;margin-top:8px">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>`);
  if (cases.length) { w.document.write(`<div class="tc"><h3>Table of Cases</h3>`); cases.forEach((c, i) => w.document.write(`<div class="ti">${i + 1}. ${c}</div>`)); w.document.write(`</div>`); }
  if (secs) secs.forEach(s => { w.document.write(`<h2>${s.title}</h2>`); s.content.split("\n").forEach(l => { if (l.trim()) w.document.write(`<p>${l}</p>`); }); });
  else content.split("\n").forEach(l => { if (l.trim()) w.document.write(`<p>${l}</p>`); });
  w.document.write(`<div class="ft">The Ironclad Jurist — Verify on SCC Online / Manupatra<br>AI-generated — review before submission</div></body></html>`);
  w.document.close(); setTimeout(() => w.print(), 400);
}

function SectionBlock({ title, content, index }) {
  const [open, setOpen] = useState(true);
  const c = SEC_COL[title] || "#6AAAD4";
  return (
    <div style={{ marginBottom: 6, borderLeft: `3px solid ${c}40`, background: `${c}06`, borderRadius: "0 10px 10px 0", animation: `secIn .4s ease ${index * .05}s both` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: c, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "left" }}>
        <span style={{ flex: 1 }}>{title}</span>
        <span style={{ fontSize: 10, opacity: .4, transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform .3s" }}>▾</span>
      </button>
      {open && <div style={{ padding: "0 16px 14px 20px", fontSize: 15, lineHeight: 2, color: "#C8D8E8", whiteSpace: "pre-wrap" }}>{content}</div>}
    </div>
  );
}

function CasesPanel({ cases }) {
  const [o, setO] = useState(false);
  return (<div style={{ marginTop: 6 }}>
    <button onClick={() => setO(!o)} style={{ padding: "5px 12px", borderRadius: 10, border: "1px solid rgba(106,170,212,.1)", background: "rgba(106,170,212,.03)", fontSize: 12, color: "#5A9AC0", cursor: "pointer" }}>📋 Cases ({cases.length}) {o ? "▴" : "▾"}</button>
    {o && <div style={{ marginTop: 4, padding: "8px 12px", background: "rgba(106,170,212,.03)", borderRadius: 10, border: "1px solid rgba(106,170,212,.05)" }}>
      {cases.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#88B0D0", padding: "3px 0", borderBottom: i < cases.length - 1 ? "1px solid rgba(106,170,212,.04)" : "none", fontStyle: "italic" }}>{i + 1}. {c}</div>)}
    </div>}
  </div>);
}

function Msg({ msg, onPDF, onAction, isStreaming }) {
  if (msg.role === "user") return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 20px", animation: "msgUp .3s ease both" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#1A3A5A,#2A5070)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: "#C0D8F0" }}>T</div>
        <div style={{ flex: 1, paddingTop: 4, fontSize: 15, lineHeight: 1.8, color: "#D0E0F0" }}>{msg.content}</div>
      </div>
    </div>
  );

  const secs = !isStreaming ? parseSections(msg.content) : null;
  const cases = !isStreaming ? extractCases(msg.content) : [];
  const ab = { padding: "5px 12px", borderRadius: 10, border: "1px solid rgba(106,170,212,.08)", background: "rgba(106,170,212,.02)", fontSize: 12, color: "#5A90B0", cursor: "pointer", transition: "all .2s" };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 20px", animation: "msgUp .35s ease both" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#0E2A40,#1A3854)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, border: "1px solid rgba(106,170,212,.12)" }}>⚖️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#4A7AA8", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Ironclad Jurist</div>
          {secs ? (
            <div style={{ background: "rgba(106,170,212,.02)", borderRadius: 12, padding: 10, border: "1px solid rgba(106,170,212,.03)" }}>
              {secs.map((s, i) => <SectionBlock key={i} title={s.title} content={s.content} index={i} />)}
            </div>
          ) : (
            <div style={{ fontSize: 15, lineHeight: 2, color: "#C0D4E8", whiteSpace: "pre-wrap" }}>
              {msg.content}
              {isStreaming && <span style={{ display: "inline-block", width: 2, height: 16, background: "#6AAAD4", marginLeft: 2, animation: "blink 1s infinite" }} />}
            </div>
          )}
          {cases.length > 0 && <CasesPanel cases={cases} />}
          {!isStreaming && msg.content.length > 50 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={() => onPDF(msg.content)} style={ab} onMouseEnter={e => e.currentTarget.style.background = "rgba(106,170,212,.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(106,170,212,.02)"}>📥 PDF</button>
              {[
                { l: "🌍 Foreign Cases", p: "Add 3+ foreign cases from UK, US, Australia, Canada, EU." },
                { l: "📄 Full Project", p: "Expand into 30-50 page project with chapters and bibliography." },
                { l: "🎓 Simplify", p: "Re-explain simply for a first-year student." },
                { l: "👨‍⚖️ Advanced", p: "Rewrite at Senior Advocate level." },
                { l: "🔴 Critique", p: "As strict professor, red-flag weaknesses and gaps." },
                { l: "🗣️ Hindi", p: "Explain in Hindi keeping English legal terms." },
              ].map((a, i) => (
                <button key={i} onClick={() => onAction(a.p)} style={ab} onMouseEnter={e => e.currentTarget.style.background = "rgba(106,170,212,.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(106,170,212,.02)"}>{a.l}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ ANIMATED SVG ROBO-DOG ═══ */
function RoboDog({ name, cw }) {
  const [posX, setPosX] = useState(200);
  const [state, setState] = useState("walking");
  const [flip, setFlip] = useState(false);
  const [care, setCare] = useState("");
  const [showC, setShowC] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [wagSpeed, setWagSpeed] = useState(1);
  const [walkCycle, setWalkCycle] = useState(0);
  const tgtX = useRef(400);
  const stTimer = useRef(null);

  // Care messages
  useEffect(() => {
    const pop = () => { 
      setCare(PET_MSGS[Math.floor(Math.random() * PET_MSGS.length)]); 
      setShowC(true); 
      setTimeout(() => setShowC(false), 5000); 
    };
    const t = setTimeout(pop, 15000);
    const iv = setInterval(pop, 100000 + Math.random() * 80000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  // State cycle
  useEffect(() => {
    const cycle = () => {
      setState(prev => {
        if (prev === "walking") {
          stTimer.current = setTimeout(cycle, 4000 + Math.random() * 4000);
          return Math.random() > 0.3 ? "sitting" : "sleeping";
        } else {
          tgtX.current = 100 + Math.random() * (cw - 300);
          stTimer.current = setTimeout(cycle, 5000 + Math.random() * 5000);
          return "walking";
        }
      });
    };
    stTimer.current = setTimeout(cycle, 3000 + Math.random() * 3000);
    return () => { if (stTimer.current) clearTimeout(stTimer.current); };
  }, [cw]);

  // Walking animation - SLOW
  useEffect(() => {
    if (state !== "walking") return;
    let id;
    const tick = () => {
      setPosX(prev => {
        const dx = tgtX.current - prev;
        if (Math.abs(dx) < 5) {
          // Reached target - sit down
          setState("sitting");
          return prev;
        }
        const speed = 0.4; // MUCH SLOWER
        if (dx > 0) setFlip(false); else setFlip(true);
        return prev + (dx > 0 ? speed : -speed);
      });
      setWalkCycle(c => (c + 0.15) % (Math.PI * 2)); // Slower leg animation
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [state]);

  // Tail wagging animation
  useEffect(() => {
    if (state === "sleeping") {
      setWagSpeed(0.2);
    } else if (hearts.length > 0) {
      setWagSpeed(3);
    } else {
      setWagSpeed(state === "walking" ? 1.5 : 0.8);
    }
  }, [state, hearts.length]);

  useEffect(() => { 
    if (hearts.length) { 
      const t = setTimeout(() => setHearts(h => h.slice(1)), 1200); 
      return () => clearTimeout(t); 
    } 
  }, [hearts]);

  const feed = () => {
    setHearts(h => [...h, { id: Date.now(), x: Math.random() * 30 - 15 }]);
  };

  // Walking bob
  const bodyBob = state === "walking" ? Math.sin(walkCycle * 2) * 2 : 0;
  
  // Leg positions for walking
  const frontLegAngle = state === "walking" ? Math.sin(walkCycle) * 25 : 0;
  const backLegAngle = state === "walking" ? Math.sin(walkCycle + Math.PI) * 25 : 0;
  
  // Tail wag
  const tailAngle = Math.sin(Date.now() * 0.005 * wagSpeed) * (state === "sleeping" ? 5 : 20);

  return (<>
    <div onClick={feed} style={{
      position: "fixed",
      left: posX - 60,
      bottom: 20,
      zIndex: 50,
      cursor: "pointer",
      transform: `scaleX(${flip ? -1 : 1})`,
      transition: state === "walking" ? "none" : "left 0.5s ease-out",
    }} title={`Click ${name}!`}>
      {hearts.map(h => <div key={h.id} style={{ position: "absolute", top: -20, left: `calc(50% + ${h.x}px)`, fontSize: 16, animation: "heartFloat 1.2s ease-out forwards", pointerEvents: "none" }}>💙</div>)}
      
      <svg width="120" height="90" viewBox="0 0 120 90" style={{ filter: "drop-shadow(0 2px 8px rgba(106,170,212,0.3))" }}>
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A9CD0" />
            <stop offset="100%" stopColor="#3A7CB0" />
          </linearGradient>
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6AAAD4" />
            <stop offset="100%" stopColor="#4A8AB4" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="60" cy="82" rx="35" ry="6" fill="rgba(106,170,212,0.15)" />

        {state === "sleeping" ? (
          /* Sleeping pose - curled up */
          <g transform="translate(0, 10)">
            {/* Body - oval curled */}
            <ellipse cx="60" cy="55" rx="28" ry="20" fill="url(#bodyGrad)" transform="rotate(-15 60 55)" />
            
            {/* Head tucked in */}
            <circle cx="50" cy="48" r="14" fill="url(#headGrad)" />
            
            {/* Closed eyes */}
            <path d="M 46 47 Q 48 49 50 47" stroke="#2A4A6A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 52 47 Q 54 49 56 47" stroke="#2A4A6A" strokeWidth="2" fill="none" strokeLinecap="round" />
            
            {/* Ears down */}
            <ellipse cx="44" cy="42" rx="4" ry="7" fill="#4A8AB4" transform="rotate(-30 44 42)" />
            <ellipse cx="56" cy="42" rx="4" ry="7" fill="#4A8AB4" transform="rotate(30 56 42)" />
            
            {/* Legs tucked */}
            <rect x="55" y="60" width="6" height="8" rx="3" fill="#3A7CB0" />
            <rect x="65" y="62" width="6" height="8" rx="3" fill="#3A7CB0" />
            
            {/* Tail curled around */}
            <path d="M 80 55 Q 75 45 65 48" stroke="#4A8AB4" strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${tailAngle * 0.3} 80 55)`} />
            
            {/* Zzz */}
            <text x="75" y="35" fontSize="10" fill="#6AAAD4" opacity="0.6" fontFamily="Arial">Z</text>
            <text x="82" y="28" fontSize="8" fill="#6AAAD4" opacity="0.5" fontFamily="Arial">z</text>
            <text x="88" y="23" fontSize="6" fill="#6AAAD4" opacity="0.4" fontFamily="Arial">z</text>
          </g>
        ) : state === "sitting" ? (
          /* Sitting pose */
          <g transform={`translate(0, ${bodyBob})`}>
            {/* Body - more upright */}
            <ellipse cx="60" cy="50" rx="18" ry="22" fill="url(#bodyGrad)" />
            
            {/* Head */}
            <circle cx="60" cy="35" r="15" fill="url(#headGrad)" />
            
            {/* Eyes */}
            <circle cx="55" cy="33" r="3" fill="#2A4A6A" />
            <circle cx="65" cy="33" r="3" fill="#2A4A6A" />
            <circle cx="56" cy="32" r="1.5" fill="#C8E0F0" />
            <circle cx="66" cy="32" r="1.5" fill="#C8E0F0" />
            
            {/* Nose */}
            <circle cx="60" cy="40" r="2.5" fill="#2A4A6A" />
            
            {/* Ears - perked up */}
            <ellipse cx="52" cy="25" rx="4" ry="8" fill="#4A8AB4" transform="rotate(-25 52 25)" />
            <ellipse cx="68" cy="25" rx="4" ry="8" fill="#4A8AB4" transform="rotate(25 68 25)" />
            
            {/* Front legs - sitting */}
            <rect x="52" y="60" width="6" height="15" rx="3" fill="#3A7CB0" />
            <rect x="62" y="60" width="6" height="15" rx="3" fill="#3A7CB0" />
            
            {/* Back legs - folded */}
            <ellipse cx="48" cy="68" rx="8" ry="6" fill="#3A7CB0" />
            <ellipse cx="72" cy="68" rx="8" ry="6" fill="#3A7CB0" />
            
            {/* Tail - wagging */}
            <path d="M 75 50 Q 85 45 90 50" stroke="#4A8AB4" strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${tailAngle} 75 50)`} />
            
            {/* Antenna */}
            <line x1="60" y1="22" x2="60" y2="15" stroke="#6AAAD4" strokeWidth="2" />
            <circle cx="60" cy="15" r="3" fill="#90C0E0" />
          </g>
        ) : (
          /* Walking pose */
          <g transform={`translate(0, ${bodyBob})`}>
            {/* Body */}
            <ellipse cx="60" cy="48" rx="20" ry="16" fill="url(#bodyGrad)" />
            
            {/* Head */}
            <circle cx="75" cy="42" r="14" fill="url(#headGrad)" />
            
            {/* Eyes */}
            <circle cx="72" cy="40" r="3" fill="#2A4A6A" />
            <circle cx="80" cy="40" r="3" fill="#2A4A6A" />
            <circle cx="73" cy="39" r="1.5" fill="#C8E0F0" />
            <circle cx="81" cy="39" r="1.5" fill="#C8E0F0" />
            
            {/* Nose */}
            <circle cx="78" cy="46" r="2.5" fill="#2A4A6A" />
            
            {/* Ears */}
            <ellipse cx="70" cy="32" rx="4" ry="8" fill="#4A8AB4" transform="rotate(-20 70 32)" />
            <ellipse cx="82" cy="32" rx="4" ry="8" fill="#4A8AB4" transform="rotate(20 82 32)" />
            
            {/* Front legs - animated */}
            <g transform={`rotate(${frontLegAngle} 54 60)`}>
              <rect x="51" y="60" width="6" height="18" rx="3" fill="#3A7CB0" />
              <ellipse cx="54" cy="78" rx="4" ry="3" fill="#2A5A8A" />
            </g>
            <g transform={`rotate(${-frontLegAngle} 66 60)`}>
              <rect x="63" y="60" width="6" height="18" rx="3" fill="#3A7CB0" />
              <ellipse cx="66" cy="78" rx="4" ry="3" fill="#2A5A8A" />
            </g>
            
            {/* Back legs - animated */}
            <g transform={`rotate(${backLegAngle} 46 60)`}>
              <rect x="43" y="60" width="6" height="18" rx="3" fill="#3A7CB0" />
              <ellipse cx="46" cy="78" rx="4" ry="3" fill="#2A5A8A" />
            </g>
            <g transform={`rotate(${-backLegAngle} 74 60)`}>
              <rect x="71" y="60" width="6" height="18" rx="3" fill="#3A7CB0" />
              <ellipse cx="74" cy="78" rx="4" ry="3" fill="#2A5A8A" />
            </g>
            
            {/* Tail - wagging fast */}
            <path d="M 45 45 Q 35 40 30 45" stroke="#4A8AB4" strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${tailAngle} 45 45)`} />
            
            {/* Antenna */}
            <line x1="75" y1="30" x2="75" y2="22" stroke="#6AAAD4" strokeWidth="2" />
            <circle cx="75" cy="22" r="3" fill="#90C0E0">
              <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
      
      {/* Status badge */}
      <div style={{
        position: "absolute", bottom: -8, left: "50%",
        transform: `translateX(-50%) scaleX(${flip ? -1 : 1})`,
        background: "rgba(6,12,22,.95)", padding: "3px 12px", borderRadius: 10,
        border: "1px solid rgba(106,170,212,.2)", fontSize: 11, color: "#6AAAD4",
        whiteSpace: "nowrap", fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
        boxShadow: "0 2px 8px rgba(0,0,0,.3)"
      }}>
        {name}
        <span style={{ fontSize: 12 }}>
          {state === "walking" ? "🚶" : state === "sitting" ? "🐕" : "😴"}
        </span>
      </div>
    </div>

    {/* Care message bubble */}
    {showC && <div style={{
      position: "fixed", left: Math.max(10, Math.min(posX - 80, window.innerWidth - 210)),
      bottom: 125, zIndex: 51,
      background: "linear-gradient(135deg,#1A3050,#142840)",
      border: "1px solid rgba(106,170,212,.2)", borderRadius: 14,
      padding: "10px 16px", maxWidth: 200, fontSize: 13, color: "#90C0E0",
      lineHeight: 1.6, textAlign: "center", animation: "msgUp .3s ease both",
      boxShadow: "0 8px 24px rgba(0,0,0,.5)", pointerEvents: "none",
      fontWeight: 500
    }}>
      {care}
      {/* Speech bubble pointer */}
      <div style={{
        position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
        width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
        borderTop: "8px solid #1A3050"
      }} />
    </div>}
  </>);
}

const QZ = [
  { q: "BNS 2023 replaced?", o: ["IPC 1860", "CrPC 1973", "IEA 1872", "CPC 1908"], a: 0 },
  { q: "Right to Life — Article?", o: ["14", "19", "21", "32"], a: 2 },
  { q: "BNSS replaced?", o: ["IPC", "CrPC 1973", "Evidence Act", "Contract Act"], a: 1 },
  { q: "Kesavananda established?", o: ["Privacy", "Basic Structure", "Due Process", "Equality"], a: 1 },
  { q: "BSA replaced?", o: ["IPC", "CrPC", "Evidence Act 1872", "Sale of Goods"], a: 2 },
  { q: "Habeas Corpus means?", o: ["We command", "Certify", "Have the body", "By what authority"], a: 2 },
  { q: "Vishaka relates to?", o: ["Child rights", "Sexual harassment", "Environment", "Property"], a: 1 },
  { q: "Maneka Gandhi expanded?", o: ["Art. 14", "Art. 19", "Art. 21", "All three"], a: 3 },
  { q: "Art. 32 grants?", o: ["Equality", "Free speech", "Constitutional remedies", "Education"], a: 2 },
  { q: "Ratio vs Obiter — binds?", o: ["Both", "Neither", "Only Ratio", "Only Obiter"], a: 2 },
  { q: "Stare decisis?", o: ["New law", "Stand by decision", "Obey statute", "File appeal"], a: 1 },
  { q: "Who interprets Constitution?", o: ["Parliament", "President", "Supreme Court", "AG"], a: 2 },
];

function Quiz({ onClose }) {
  const [qs] = useState(() => { const s = [...QZ]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } return s.slice(0, 8); });
  const [idx, setIdx] = useState(0); const [sc, setSc] = useState(0); const [sel, setSel] = useState(null); const [done, setDone] = useState(false); const [sh, setSh] = useState(false);
  const pick = i => { if (sh) return; setSel(i); setSh(true); if (i === qs[idx].a) setSc(s => s + 1); setTimeout(() => { if (idx < qs.length - 1) { setIdx(x => x + 1); setSel(null); setSh(false); } else setDone(true); }, 800); };
  const ov = { position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,8,16,.85)", backdropFilter: "blur(12px)" };
  if (done) return (<div style={ov}><div style={{ background: "linear-gradient(155deg,#0C1822,#101A28)", borderRadius: 18, padding: 34, textAlign: "center", maxWidth: 340, border: "1px solid rgba(106,170,212,.08)" }}>
    <div style={{ fontSize: 40, marginBottom: 8 }}>{sc >= 6 ? "🌟" : sc >= 4 ? "✨" : "📚"}</div>
    <h3 style={{ fontSize: 20, color: "#A8CCE8", margin: "0 0 4px" }}>{sc >= 6 ? "Brilliant, Tan!" : sc >= 4 ? "Well done!" : "Keep studying!"}</h3>
    <p style={{ fontSize: 28, color: "#6AAAD4", margin: "0 0 16px", fontWeight: 700 }}>{sc}/{qs.length}</p>
    <button onClick={onClose} style={{ padding: "10px 26px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#1A3A5A,#2A4A6A)", color: "#C0D8F0", fontSize: 14 }}>Close</button>
  </div></div>);
  const q = qs[idx];
  return (<div style={ov} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div style={{ background: "linear-gradient(155deg,#0C1822,#101A28)", borderRadius: 18, padding: 26, maxWidth: 400, width: "90%", border: "1px solid rgba(106,170,212,.08)", animation: "scIn .3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontSize: 12, color: "#5A90B0" }}>Legal Quiz</span><span style={{ fontSize: 14, color: "#6AAAD4", fontWeight: 600 }}>{idx + 1}/{qs.length}</span></div>
      <div style={{ background: "rgba(106,170,212,.04)", borderRadius: 12, padding: 14, marginBottom: 14 }}><p style={{ fontSize: 17, color: "#C0D4F0", margin: 0, lineHeight: 1.5 }}>{q.q}</p></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {q.o.map((o, i) => {
          let bg = "rgba(106,170,212,.03)", bd = "rgba(106,170,212,.06)", cl = "#90B8D0";
          if (sh) { if (i === q.a) { bg = "rgba(80,184,128,.08)"; bd = "rgba(80,184,128,.2)"; cl = "#60C898"; } else if (i === sel && i !== q.a) { bg = "rgba(200,80,80,.08)"; bd = "rgba(200,80,80,.2)"; cl = "#C87070"; } }
          return <button key={i} onClick={() => pick(i)} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${bd}`, background: bg, cursor: sh ? "default" : "pointer", textAlign: "left", fontSize: 14, color: cl, transition: "all .2s" }}>{o}</button>;
        })}
      </div>
    </div>
  </div>);
}

function Naming({ onName }) {
  const [n, setN] = useState("");
  const [flowers, setFlowers] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const flowerIdRef = useRef(0);

  // Butterflies resting on plant - only move when hovered
  const [butterflies, setButterflies] = useState(
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      // Start positions on plant (bottom left corner now)
      restX: 5 + Math.random() * 15, // percentage - left side
      restY: 60 + Math.random() * 25, // percentage
      x: 5 + Math.random() * 15,
      y: 60 + Math.random() * 25,
      isFlying: false,
      wingPhase: Math.random() * Math.PI * 2,
      targetX: 0,
      targetY: 0,
      scale: 0.6 + Math.random() * 0.4,
    }))
  );

  // Animate butterflies
  useEffect(() => {
    const interval = setInterval(() => {
      setButterflies(prev => prev.map(butterfly => {
        if (!butterfly.isFlying) {
          // Resting - just gentle wing movement
          return {
            ...butterfly,
            wingPhase: butterfly.wingPhase + 0.05,
          };
        }

        // Flying - move to target
        const dx = butterfly.targetX - butterfly.x;
        const dy = butterfly.targetY - butterfly.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          // Reached target, rest there
          return {
            ...butterfly,
            isFlying: false,
            restX: butterfly.x,
            restY: butterfly.y,
            wingPhase: butterfly.wingPhase + 0.05,
          };
        }

        return {
          ...butterfly,
          x: butterfly.x + dx * 0.05,
          y: butterfly.y + dy * 0.05,
          wingPhase: butterfly.wingPhase + 0.3,
        };
      }));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Mouse interaction - butterflies fly away from cursor near plant
  useEffect(() => {
    const handleMove = (e) => {
      const mx = (e.clientX / window.innerWidth) * 100;
      const my = (e.clientY / window.innerHeight) * 100;

      setButterflies(prev => prev.map(butterfly => {
        const dx = butterfly.x - mx;
        const dy = butterfly.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If cursor is close to butterfly
        if (dist < 12) {
          // Fly away in opposite direction
          const angle = Math.atan2(dy, dx);
          const flyDistance = 20 + Math.random() * 30;
          return {
            ...butterfly,
            isFlying: true,
            targetX: butterfly.x + Math.cos(angle) * flyDistance,
            targetY: Math.max(10, Math.min(85, butterfly.y + Math.sin(angle) * flyDistance)),
          };
        }

        // Slowly return to plant if far from rest position
        if (!butterfly.isFlying) {
          const restDx = butterfly.restX - butterfly.x;
          const restDy = butterfly.restY - butterfly.y;
          const restDist = Math.sqrt(restDx * restDx + restDy * restDy);
          
          if (restDist > 1) {
            return {
              ...butterfly,
              isFlying: true,
              targetX: butterfly.restX,
              targetY: butterfly.restY,
            };
          }
        }

        return butterfly;
      }));
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    let lastSpawn = 0;
    const handleMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const now = Date.now();
      if (now - lastSpawn < 80) return;
      lastSpawn = now;
      flowerIdRef.current++;
      const id = flowerIdRef.current;
      const size = 20 + Math.random() * 30;
      const rotation = Math.random() * 360;
      const drift = (Math.random() - 0.5) * 60;
      const lilyType = Math.floor(Math.random() * 3);
      setFlowers(prev => [...prev.slice(-25), { id, x: e.clientX, y: e.clientY, size, rotation, drift, lilyType }]);
      setTimeout(() => setFlowers(prev => prev.filter(f => f.id !== id)), 2000);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const LilySVG = ({ size, rotation, lilyType }) => {
    if (lilyType === 0) return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${rotation}deg)` }}>
        <defs><radialGradient id="lg1"><stop offset="0%" stopColor="#6AAAD4" stopOpacity=".7"/><stop offset="100%" stopColor="#2A5070" stopOpacity=".1"/></radialGradient></defs>
        {[0,60,120,180,240,300].map(a => <ellipse key={a} cx="30" cy="30" rx="6" ry="16" fill="url(#lg1)" transform={`rotate(${a} 30 30)`}/>)}
        <circle cx="30" cy="30" r="4" fill="#A8CCE8" opacity=".6"/>
        <circle cx="30" cy="30" r="2" fill="#C8E0F0" opacity=".8"/>
      </svg>
    );
    if (lilyType === 1) return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${rotation}deg)` }}>
        <defs><radialGradient id="lg2"><stop offset="0%" stopColor="#90C0E0" stopOpacity=".6"/><stop offset="100%" stopColor="#1A3A5A" stopOpacity=".05"/></radialGradient></defs>
        {[0,72,144,216,288].map(a => <ellipse key={a} cx="30" cy="30" rx="5" ry="14" fill="url(#lg2)" transform={`rotate(${a} 30 30)`}/>)}
        {[36,108,180,252,324].map(a => <ellipse key={a} cx="30" cy="30" rx="4" ry="10" fill="url(#lg2)" opacity=".5" transform={`rotate(${a} 30 30)`}/>)}
        <circle cx="30" cy="30" r="3.5" fill="#6AAAD4" opacity=".5"/>
        {[0,120,240].map(a => <circle key={a} cx={30 + Math.cos(a*Math.PI/180)*2} cy={30 + Math.sin(a*Math.PI/180)*2} r="1" fill="#C8E0F0" opacity=".7"/>)}
      </svg>
    );
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${rotation}deg)` }}>
        <defs><radialGradient id="lg3"><stop offset="0%" stopColor="#5A9CD0" stopOpacity=".5"/><stop offset="100%" stopColor="#0E2A40" stopOpacity=".05"/></radialGradient></defs>
        {[0,45,90,135,180,225,270,315].map(a => <path key={a} d={`M30 30 Q${30+Math.cos((a-20)*Math.PI/180)*14} ${30+Math.sin((a-20)*Math.PI/180)*14} ${30+Math.cos(a*Math.PI/180)*18} ${30+Math.sin(a*Math.PI/180)*18} Q${30+Math.cos((a+20)*Math.PI/180)*14} ${30+Math.sin((a+20)*Math.PI/180)*14} 30 30`} fill="url(#lg3)"/>)}
        <circle cx="30" cy="30" r="5" fill="#1A3A5A" opacity=".4"/>
        <circle cx="30" cy="30" r="3" fill="#6AAAD4" opacity=".5"/>
        <circle cx="30" cy="30" r="1.5" fill="#A8CCE8" opacity=".7"/>
      </svg>
    );
  };

  return (<div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(165deg,#040810,#081018,#0A1420)", cursor: "none", overflow: "hidden" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Lora:wght@0,400;0,500;0,600&display=swap');
      @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes lilyFade{0%{opacity:1;transform:translate(0,0) scale(1) rotate(0deg)}100%{opacity:0;transform:translate(var(--dx),40px) scale(0.3) rotate(90deg)}}
      @keyframes giantLilyPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.7}50%{transform:translate(-50%,-50%) scale(1.1);opacity:.9}}
      @keyframes wingFlap{0%,100%{transform:rotateY(0deg)}50%{transform:rotateY(20deg)}}
    `}</style>

    {/* Realistic flowering plant emerging from bottom-left corner */}
    <div style={{
      position: "fixed",
      bottom: -50,
      left: -50,
      width: "500px",
      height: "600px",
      zIndex: 1997,
      pointerEvents: "none",
    }}>
      <svg width="500" height="600" viewBox="0 0 500 600">
        <defs>
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B8E4E" />
            <stop offset="100%" stopColor="#4A7C3F" />
          </linearGradient>
          <radialGradient id="petalGrad">
            <stop offset="0%" stopColor="#E8D4F8" />
            <stop offset="40%" stopColor="#D4B8E8" />
            <stop offset="100%" stopColor="#B89CD8" />
          </radialGradient>
          <radialGradient id="petalWhiteGrad">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F0E8F8" />
            <stop offset="100%" stopColor="#D8C8E8" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main stems with natural curves and sway */}
        <g>
          {/* Primary tall stem */}
          <path d="M 120 600 Q 115 500 110 400 Q 105 300 100 200 Q 95 120 90 50" 
            stroke="url(#stemGrad)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9">
            <animateTransform attributeName="transform" type="rotate" 
              values="0 120 600; -3 120 600; 3 120 600; 0 120 600" 
              dur="5s" repeatCount="indefinite" />
          </path>
          
          {/* Secondary stem - branching left */}
          <path d="M 110 400 Q 80 350 60 300 Q 45 250 35 200" 
            stroke="url(#stemGrad)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85">
            <animateTransform attributeName="transform" type="rotate" 
              values="0 110 400; -2.5 110 400; 2 110 400; 0 110 400" 
              dur="6s" repeatCount="indefinite" />
          </path>
          
          {/* Tertiary stem - branching right */}
          <path d="M 105 300 Q 140 260 170 220 Q 190 180 200 140" 
            stroke="url(#stemGrad)" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85">
            <animateTransform attributeName="transform" type="rotate" 
              values="0 105 300; 2.5 105 300; -2 105 300; 0 105 300" 
              dur="5.5s" repeatCount="indefinite" />
          </path>
          
          {/* Small branch stems */}
          <path d="M 100 200 Q 120 180 135 165" 
            stroke="#5A8E45" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
            <animateTransform attributeName="transform" type="rotate" 
              values="0 100 200; 1.5 100 200; -1.5 100 200; 0 100 200" 
              dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M 95 120 Q 75 100 65 85" 
            stroke="#5A8E45" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7">
            <animateTransform attributeName="transform" type="rotate" 
              values="0 95 120; -1.5 95 120; 1.5 95 120; 0 95 120" 
              dur="4.5s" repeatCount="indefinite" />
          </path>
        </g>
        
        {/* Realistic leaves along stems */}
        {[
          { x: 90, y: 50, rotate: -35, scale: 1.4, dur: 5 },
          { x: 100, y: 100, rotate: 25, scale: 1.2, dur: 5.5 },
          { x: 85, y: 150, rotate: -40, scale: 1.3, dur: 6 },
          { x: 110, y: 200, rotate: 30, scale: 1.1, dur: 5.2 },
          { x: 95, y: 250, rotate: -25, scale: 1.25, dur: 5.8 },
          { x: 35, y: 200, rotate: -50, scale: 1, dur: 6.2 },
          { x: 50, y: 260, rotate: -35, scale: 1.1, dur: 5.4 },
          { x: 200, y: 140, rotate: 45, scale: 0.95, dur: 5.9 },
          { x: 180, y: 180, rotate: 38, scale: 1.05, dur: 5.3 },
          { x: 135, y: 165, rotate: 20, scale: 0.9, dur: 4.8 },
          { x: 65, y: 85, rotate: -42, scale: 0.85, dur: 6.5 },
          { x: 105, y: 320, rotate: 15, scale: 1.15, dur: 5.7 },
        ].map((leaf, i) => (
          <g key={i} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotate})`}>
            <ellipse cx="0" cy="0" rx="28" ry="45" fill="#5A9CD0" opacity="0.88" 
              filter="url(#softGlow)">
              <animateTransform attributeName="transform" type="rotate" 
                values="0 0 0; -4 0 0; 4 0 0; 0 0 0" 
                dur={`${leaf.dur}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.88;0.92;0.88" 
                dur={`${leaf.dur}s`} repeatCount="indefinite" />
            </ellipse>
            {/* Leaf veins */}
            <path d="M 0 -45 L 0 45" stroke="#4A8AB4" strokeWidth="2.5" opacity="0.6" />
            <path d="M 0 -30 Q -12 -28 -20 -22" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 -30 Q 12 -28 20 -22" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 -10 Q -15 -6 -22 0" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 -10 Q 15 -6 22 0" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 15 Q -14 18 -20 24" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 15 Q 14 18 20 24" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 35 Q -10 37 -16 40" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0 35 Q 10 37 16 40" stroke="#4A8AB4" strokeWidth="1.5" opacity="0.5" />
          </g>
        ))}
        
        {/* Beautiful detailed flowers */}
        {/* Main large flower at top */}
        <g transform="translate(90, 50)">
          <g>
            <animateTransform attributeName="transform" type="rotate" 
              values="0 0 0; -2 0 0; 2 0 0; 0 0 0" 
              dur="4s" repeatCount="indefinite" />
            
            {/* Flower petals - 5 petals arranged naturally */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-22" rx="10" ry="18" fill="url(#petalWhiteGrad)" 
                  stroke="#D8C8E8" strokeWidth="0.5" opacity="0.95" filter="url(#softGlow)">
                  <animate attributeName="opacity" values="0.95;1;0.95" 
                    dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                </ellipse>
                {/* Petal details - veins */}
                <path d={`M 0 -22 L 0 -${22 + 16}`} stroke="#C8B8D8" strokeWidth="1" opacity="0.4" />
                <path d={`M 0 -28 Q -3 -32 -5 -35`} stroke="#C8B8D8" strokeWidth="0.8" opacity="0.3" />
                <path d={`M 0 -28 Q 3 -32 5 -35`} stroke="#C8B8D8" strokeWidth="0.8" opacity="0.3" />
              </g>
            ))}
            
            {/* Flower center - detailed */}
            <circle cx="0" cy="0" r="8" fill="#FFD93D" opacity="0.95" />
            <circle cx="0" cy="0" r="6" fill="#F7C531" opacity="0.9" />
            {/* Pollen dots */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <circle key={i} 
                  cx={Math.cos(angle) * 4} 
                  cy={Math.sin(angle) * 4} 
                  r="0.8" 
                  fill="#CC9A2B" 
                  opacity="0.8" />
              );
            })}
            <circle cx="0" cy="0" r="3" fill="#E8A82E" opacity="0.7" />
          </g>
        </g>
        
        {/* Secondary flower - smaller */}
        <g transform="translate(135, 165)">
          <g>
            <animateTransform attributeName="transform" type="rotate" 
              values="0 0 0; 2 0 0; -2 0 0; 0 0 0" 
              dur="4.5s" repeatCount="indefinite" />
            
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-16" rx="7" ry="13" fill="url(#petalGrad)" 
                  stroke="#C8A8D8" strokeWidth="0.5" opacity="0.92" filter="url(#softGlow)" />
                <path d={`M 0 -16 L 0 -${16 + 11}`} stroke="#B898C8" strokeWidth="0.8" opacity="0.4" />
              </g>
            ))}
            
            <circle cx="0" cy="0" r="6" fill="#FFE066" opacity="0.95" />
            <circle cx="0" cy="0" r="4" fill="#F7D054" opacity="0.9" />
            <circle cx="0" cy="0" r="2" fill="#E8B83E" opacity="0.7" />
          </g>
        </g>
        
        {/* Third flower - different angle */}
        <g transform="translate(35, 200)">
          <g>
            <animateTransform attributeName="transform" type="rotate" 
              values="0 0 0; -1.5 0 0; 1.5 0 0; 0 0 0" 
              dur="5s" repeatCount="indefinite" />
            
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-14" rx="6" ry="12" fill="url(#petalWhiteGrad)" 
                  stroke="#E8D8F8" strokeWidth="0.5" opacity="0.93" filter="url(#softGlow)" />
              </g>
            ))}
            
            <circle cx="0" cy="0" r="5" fill="#FFD147" opacity="0.95" />
            <circle cx="0" cy="0" r="3" fill="#E8B837" opacity="0.8" />
          </g>
        </g>
        
        {/* Small buds */}
        <g transform="translate(65, 85)">
          <ellipse cx="0" cy="0" rx="4" ry="6" fill="#D4B8E8" opacity="0.8" 
            transform="rotate(-20)">
            <animateTransform attributeName="transform" type="rotate" 
              values="-20 0 0; -22 0 0; -18 0 0; -20 0 0" 
              dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="0" cy="0" rx="3" ry="5" fill="#C8A8D8" opacity="0.6" 
            transform="rotate(-20)" />
        </g>
        
        <g transform="translate(200, 140)">
          <ellipse cx="0" cy="0" rx="3.5" ry="5.5" fill="#E8D4F8" opacity="0.8" 
            transform="rotate(25)">
            <animateTransform attributeName="transform" type="rotate" 
              values="25 0 0; 27 0 0; 23 0 0; 25 0 0" 
              dur="3.5s" repeatCount="indefinite" />
          </ellipse>
        </g>
      </svg>
    </div>

    {/* Butterflies on plant - matching dog colors */}
    {butterflies.map(butterfly => {
      const wingFlap = butterfly.isFlying ? Math.sin(butterfly.wingPhase) : Math.sin(butterfly.wingPhase) * 0.3;
      const leftWingRotate = wingFlap * 35;
      const rightWingRotate = -wingFlap * 35;
      
      return (
        <div key={butterfly.id} style={{
          position: "fixed",
          left: `${butterfly.x}%`,
          top: `${butterfly.y}%`,
          zIndex: 1999,
          pointerEvents: "none",
          transform: `scale(${butterfly.scale})`,
          filter: "drop-shadow(0 2px 8px rgba(90,156,208,0.3))",
          transition: butterfly.isFlying ? "none" : "all 0.5s ease-out",
        }}>
          <svg width="50" height="40" viewBox="0 0 50 40">
            <defs>
              <radialGradient id={`bfGrad${butterfly.id}`}>
                <stop offset="0%" stopColor="#90C0E0" />
                <stop offset="50%" stopColor="#6AAAD4" />
                <stop offset="100%" stopColor="#5A9CD0" />
              </radialGradient>
            </defs>
            
            {/* Left wing - blue like dog */}
            <g transform={`rotate(${leftWingRotate} 25 20)`} style={{ transformOrigin: '25px 20px' }}>
              <ellipse cx="15" cy="18" rx="12" ry="15" fill={`url(#bfGrad${butterfly.id})`} opacity="0.95" />
              <ellipse cx="12" cy="28" rx="8" ry="10" fill="#5A9CD0" opacity="0.9" />
              <circle cx="15" cy="14" r="2.5" fill="#A8CCE8" opacity="0.8" />
              <circle cx="18" cy="19" r="1.5" fill="#3A7CB0" opacity="0.5" />
              <circle cx="10" cy="24" r="2" fill="#A8CCE8" opacity="0.7" />
            </g>
            
            {/* Right wing - blue like dog */}
            <g transform={`rotate(${rightWingRotate} 25 20)`} style={{ transformOrigin: '25px 20px' }}>
              <ellipse cx="35" cy="18" rx="12" ry="15" fill={`url(#bfGrad${butterfly.id})`} opacity="0.95" />
              <ellipse cx="38" cy="28" rx="8" ry="10" fill="#5A9CD0" opacity="0.9" />
              <circle cx="35" cy="14" r="2.5" fill="#A8CCE8" opacity="0.8" />
              <circle cx="32" cy="19" r="1.5" fill="#3A7CB0" opacity="0.5" />
              <circle cx="40" cy="24" r="2" fill="#A8CCE8" opacity="0.7" />
            </g>
            
            {/* Body */}
            <ellipse cx="25" cy="20" rx="2.5" ry="10" fill="#2A5A8A" />
            <circle cx="25" cy="14" r="3" fill="#3A7CB0" />
            
            {/* Antennae */}
            <path d="M 25 14 Q 23 10 22 8" stroke="#2A5A8A" strokeWidth="1" fill="none" strokeLinecap="round" />
            <circle cx="22" cy="8" r="1.2" fill="#2A5A8A" />
            <path d="M 25 14 Q 27 10 28 8" stroke="#2A5A8A" strokeWidth="1" fill="none" strokeLinecap="round" />
            <circle cx="28" cy="8" r="1.2" fill="#2A5A8A" />
          </svg>
        </div>
      );
    })}

    {/* Giant cursor lily */}
    <div style={{ position: "fixed", left: mousePos.x, top: mousePos.y, zIndex: 2002, pointerEvents: "none", transform: "translate(-50%,-50%)", animation: "giantLilyPulse 2s ease-in-out infinite" }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <defs>
          <radialGradient id="cursorLily">
            <stop offset="0%" stopColor="#A8CCE8" stopOpacity=".9"/>
            <stop offset="60%" stopColor="#6AAAD4" stopOpacity=".6"/>
            <stop offset="100%" stopColor="#2A5070" stopOpacity=".1"/>
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g filter="url(#glow)">
          {[0,60,120,180,240,300].map(a => <ellipse key={a} cx="30" cy="30" rx="7" ry="18" fill="url(#cursorLily)" transform={`rotate(${a} 30 30)`}/>)}
          <circle cx="30" cy="30" r="5" fill="#C8E0F0" opacity=".8"/>
          <circle cx="30" cy="30" r="3" fill="#E0F0FF" opacity=".9"/>
          {[0,60,120,180,240,300].map(a => <circle key={a} cx={30+Math.cos(a*Math.PI/180)*3} cy={30+Math.sin(a*Math.PI/180)*3} r=".8" fill="#F0F8FF" opacity=".8"/>)}
        </g>
      </svg>
    </div>

    {/* Cursor glow ring */}
    <div style={{ position: "fixed", left: mousePos.x, top: mousePos.y, zIndex: 2001, pointerEvents: "none", transform: "translate(-50%,-50%)", width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(106,170,212,.12) 0%, transparent 70%)", transition: "left .05s, top .05s" }}/>

    {/* Trail flowers */}
    {flowers.map(f => (
      <div key={f.id} style={{ position: "fixed", left: f.x, top: f.y, zIndex: 2001, pointerEvents: "none", transform: "translate(-50%,-50%)", "--dx": `${f.drift}px`, animation: "lilyFade 2s ease-out forwards" }}>
        <LilySVG size={f.size} rotation={f.rotation} lilyType={f.lilyType} />
      </div>
    ))}

    {/* Floating ambient lilies */}
    {[...Array(8)].map((_, i) => (
      <div key={`ambient-${i}`} style={{ position: "fixed", left: `${10 + (i * 12) % 90}%`, top: `${5 + (i * 17) % 85}%`, zIndex: 1999, pointerEvents: "none", opacity: .08 + (i % 3) * .04, animation: `bob ${3 + i * .5}s ease-in-out ${i * .3}s infinite`, transform: `rotate(${i * 45}deg) scale(${.6 + (i % 4) * .2})` }}>
        <svg width="50" height="50" viewBox="0 0 60 60">
          {[0,60,120,180,240,300].map(a => <ellipse key={a} cx="30" cy="30" rx="6" ry="16" fill="#6AAAD4" opacity=".3" transform={`rotate(${a} 30 30)`}/>)}
          <circle cx="30" cy="30" r="4" fill="#90C0E0" opacity=".2"/>
        </svg>
      </div>
    ))}

    <div style={{ textAlign: "center", animation: "fadeUp .7s ease both", maxWidth: 380, padding: "0 24px", position: "relative", zIndex: 2000, margin: "0 auto" }}>
      <div style={{ animation: "bob 3s ease-in-out infinite", marginBottom: 16, display: "flex", justifyContent: "center" }}>
        {/* Robo-dog preview centered */}
        <svg width="150" height="120" viewBox="0 0 120 90">
          <defs>
            <linearGradient id="previewBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5A9CD0" />
              <stop offset="100%" stopColor="#3A7CB0" />
            </linearGradient>
            <linearGradient id="previewHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6AAAD4" />
              <stop offset="100%" stopColor="#4A8AB4" />
            </linearGradient>
          </defs>
          <ellipse cx="60" cy="50" rx="18" ry="22" fill="url(#previewBodyGrad)" />
          <circle cx="60" cy="35" r="15" fill="url(#previewHeadGrad)" />
          <circle cx="55" cy="33" r="3" fill="#2A4A6A" />
          <circle cx="65" cy="33" r="3" fill="#2A4A6A" />
          <circle cx="56" cy="32" r="1.5" fill="#C8E0F0" />
          <circle cx="66" cy="32" r="1.5" fill="#C8E0F0" />
          <circle cx="60" cy="40" r="2.5" fill="#2A4A6A" />
          <ellipse cx="52" cy="25" rx="4" ry="8" fill="#4A8AB4" transform="rotate(-25 52 25)" />
          <ellipse cx="68" cy="25" rx="4" ry="8" fill="#4A8AB4" transform="rotate(25 68 25)" />
          <rect x="52" y="60" width="6" height="15" rx="3" fill="#3A7CB0" />
          <rect x="62" y="60" width="6" height="15" rx="3" fill="#3A7CB0" />
          <ellipse cx="48" cy="68" rx="8" ry="6" fill="#3A7CB0" />
          <ellipse cx="72" cy="68" rx="8" ry="6" fill="#3A7CB0" />
          <path d="M 75 50 Q 85 45 90 50" stroke="#4A8AB4" strokeWidth="5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 75 50; 20 75 50; -20 75 50; 0 75 50" dur="1s" repeatCount="indefinite" />
          </path>
          <line x1="60" y1="22" x2="60" y2="15" stroke="#6AAAD4" strokeWidth="2" />
          <circle cx="60" cy="15" r="3" fill="#90C0E0">
            <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 300, color: "#A8CCE8", margin: "0 0 6px" }}>Ironclad Jurist</h1>
      <p style={{ fontSize: 14, color: "#4A7090", margin: "0 0 6px" }}>Your Legal AI for Tan</p>
      <p style={{ fontSize: 13, color: "#2E5070", margin: "0 0 20px" }}>Name your study buddy first!</p>
      <input value={n} onChange={e => setN(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && n.trim()) onName(n.trim()); }} placeholder="Name your study buddy..." autoFocus
        style={{ width: "100%", padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(106,170,212,.12)", background: "rgba(106,170,212,.04)", color: "#B8D0E8", fontSize: 16, textAlign: "center", outline: "none", boxSizing: "border-box", cursor: "none" }} />
      <button onClick={() => { if (n.trim()) onName(n.trim()); }} disabled={!n.trim()} style={{ marginTop: 12, padding: "12px 36px", borderRadius: 18, border: "none", cursor: n.trim() ? "none" : "default", background: n.trim() ? "linear-gradient(135deg,#1A3A5A,#2A5070)" : "rgba(106,170,212,.08)", color: n.trim() ? "#C8E0F8" : "#2A4A6A", fontSize: 15 }}>Start</button>
    </div>
  </div>);
}

function Sidebar({ chats, activeId, onSelect, onNew, onDelete, petName, onQuiz, onJoke, open }) {
  return (<div style={{ width: open ? 260 : 0, minWidth: open ? 260 : 0, height: "100%", background: "#080C14", borderRight: "1px solid rgba(106,170,212,.04)", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width .25s,min-width .25s" }}>
    <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(106,170,212,.04)" }}>
      <div style={{ fontSize: 16, color: "#6AAAD4", fontWeight: 600 }}>⚖️ Ironclad Jurist</div>
      <div style={{ fontSize: 10, color: "#2A4868", letterSpacing: ".1em" }}>FOR TAN · LEGAL AI</div>
    </div>
    <div style={{ padding: "10px 12px" }}>
      <button onClick={onNew} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(106,170,212,.1)", background: "rgba(106,170,212,.04)", color: "#7AB0D0", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(106,170,212,.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(106,170,212,.04)"}>
        <span style={{ fontSize: 16 }}>+</span> New Chat
      </button>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
      <div style={{ fontSize: 10, color: "#2A4A6A", padding: "8px 8px 4px", letterSpacing: ".08em", textTransform: "uppercase" }}>Recent</div>
      {chats.map(c => (
        <div key={c.id} onClick={() => onSelect(c.id)} style={{ padding: "9px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer", background: c.id === activeId ? "rgba(106,170,212,.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background .2s" }}
          onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = "rgba(106,170,212,.04)"; }} onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = "transparent"; }}>
          <span style={{ fontSize: 13, color: c.id === activeId ? "#90C0E0" : "#4A7898", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.title}</span>
          <button onClick={e => { e.stopPropagation(); onDelete(c.id); }} style={{ background: "none", border: "none", fontSize: 11, color: "#2A4A6A", cursor: "pointer", padding: "2px 4px", opacity: .5 }}>×</button>
        </div>
      ))}
    </div>
    <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(106,170,212,.04)", display: "flex", flexDirection: "column", gap: 4 }}>
      <button onClick={onQuiz} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(106,170,212,.06)", background: "transparent", color: "#4A7898", fontSize: 12, cursor: "pointer", textAlign: "left" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(106,170,212,.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>🎮 Legal Quiz</button>
      <button onClick={onJoke} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(106,170,212,.06)", background: "transparent", color: "#4A7898", fontSize: 12, cursor: "pointer", textAlign: "left" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(106,170,212,.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>😂 Make Tan Laugh</button>
      <div style={{ fontSize: 10, color: "#1A3040", textAlign: "center", paddingTop: 4 }}>{petName} is watching! 🐾</div>
    </div>
  </div>);
}

export default function App() {
  const [pet, setPet] = useState(null);
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("research");
  const [quiz, setQuiz] = useState(false);
  const [joke, setJoke] = useState("");
  const [showJ, setShowJ] = useState(false);
  const [sbOpen, setSbOpen] = useState(true);
  const [cw, setCw] = useState(1200);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const msgs = chats.find(c => c.id === active)?.messages || [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, active, loading, streaming]);
  useEffect(() => { const u = () => setCw(window.innerWidth); u(); window.addEventListener("resize", u); return () => window.removeEventListener("resize", u); }, []);

  const newChat = useCallback(() => {
    const id = Date.now().toString();
    setChats(p => [{ id, title: "New chat", messages: [] }, ...p]);
    setActive(id); setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
    return id;
  }, []);

  const delChat = useCallback(id => {
    setChats(p => p.filter(c => c.id !== id));
    if (active === id) { const r = chats.filter(c => c.id !== id); setActive(r.length ? r[0].id : null); }
  }, [active, chats]);

  const send = useCallback(async (text, extraPrompt) => {
    if (!text.trim() || loading || streaming) return;
    let chatId = active;
    if (!chatId) { chatId = Date.now().toString(); setChats(p => [{ id: chatId, title: genTitle(text), messages: [] }, ...p]); setActive(chatId); }

    const mp = MODES.find(m => m.id === mode);
    const content = extraPrompt ? `${extraPrompt}\n\nQuery: ${text}` : (mp?.prompt ? mp.prompt + text : text);
    const useSearch = mp?.search || false;

    setChats(p => p.map(c => c.id === chatId ? { ...c, title: c.title === "New chat" ? genTitle(text) : c.title, messages: [...c.messages, { role: "user", content: text.trim() }] } : c));
    setInput(""); setLoading(true);

    try {
      const prev = chats.find(c => c.id === chatId)?.messages || [];
      const apiMsgs = [...prev, { role: "user", content: content.trim() }].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMsgs, useSearch }),
      });

      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Server error" })); throw new Error(err.error || "Request failed"); }

      setLoading(false); setStreaming(true);
      setChats(p => p.map(c => c.id === chatId ? { ...c, messages: [...c.messages, { role: "assistant", content: "" }] } : c));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              fullText += evt.delta.text;
              const txt = fullText;
              setChats(p => p.map(c => { if (c.id !== chatId) return c; const ms = [...c.messages]; ms[ms.length - 1] = { role: "assistant", content: txt }; return { ...c, messages: ms }; }));
            }
          } catch { }
        }
      }

      setStreaming(false);
      if (fullText) { setChats(p => p.map(c => { if (c.id !== chatId) return c; const ms = [...c.messages]; ms[ms.length - 1] = { role: "assistant", content: fullText }; return { ...c, messages: ms }; })); }
    } catch (err) {
      setLoading(false); setStreaming(false);
      setChats(p => p.map(c => c.id === chatId ? { ...c, messages: [...c.messages, { role: "assistant", content: `Error: ${err.message}. Check API key in Vercel settings.` }] } : c));
    }
  }, [active, chats, loading, streaming, mode]);

  const triggerJoke = () => { setJoke(JOKES[Math.floor(Math.random() * JOKES.length)]); setShowJ(true); setTimeout(() => setShowJ(false), 10000); };

  if (!pet) return <Naming onName={setPet} />;

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: "#060A12", fontFamily: "'Cormorant Garamond',Georgia,serif", overflow: "hidden", position: "relative", cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ctext y='22' font-size='20'%3E⚖️%3C/text%3E%3C/svg%3E") 14 14, auto` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Lora:wght@0,400;0,500;0,600&display=swap');
        @keyframes msgUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes secIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        @keyframes lilypulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes scIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes heartFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-35px) scale(.4)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:#1A2A3A #060A12}
        *::-webkit-scrollbar{width:5px}*::-webkit-scrollbar-track{background:transparent}
        *::-webkit-scrollbar-thumb{background:#1A2A3A;border-radius:3px}
        textarea:focus,input:focus{outline:none}button{font-family:inherit;cursor:pointer}
      `}</style>

      <RoboDog name={pet} cw={cw} />
      {quiz && <Quiz onClose={() => setQuiz(false)} />}

      <Sidebar chats={chats} activeId={active} onSelect={setActive} onNew={newChat} onDelete={delChat} petName={pet} onQuiz={() => setQuiz(true)} onJoke={triggerJoke} open={sbOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "linear-gradient(180deg,#080E18,#0A1420)", position: "relative" }}>
        <div style={{ padding: "8px 18px", borderBottom: "1px solid rgba(106,170,212,.03)", background: "rgba(6,10,18,.95)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSbOpen(!sbOpen)} style={{ background: "none", border: "none", fontSize: 18, color: "#4A7898", padding: "2px 6px" }}>☰</button>
            <div style={{ display: "flex", gap: 3 }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, border: mode === m.id ? "1px solid rgba(106,170,212,.15)" : "1px solid transparent", background: mode === m.id ? "rgba(106,170,212,.08)" : "transparent", color: mode === m.id ? "#90C0E0" : "#3A6080", transition: "all .2s" }}>{m.icon} {m.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {streaming && <span style={{ fontSize: 11, color: "#6AAAD4", animation: "lilypulse 1.3s infinite" }}>● Streaming</span>}
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#50B880" }} /><span style={{ fontSize: 10, color: "#408868" }}>LIVE</span>
          </div>
        </div>

        {showJ && <div style={{ padding: "10px 20px", background: "rgba(106,170,212,.04)", borderBottom: "1px solid rgba(106,170,212,.04)", animation: "msgUp .3s ease both" }}><div style={{ maxWidth: 780, margin: "0 auto", fontSize: 14, color: "#70A8C8", fontStyle: "italic", textAlign: "center" }}>{joke}</div></div>}

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
          {!active && !msgs.length && !loading && !streaming && (
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px", textAlign: "center", animation: "slideUp .6s ease both" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
              <h1 style={{ fontSize: 28, fontWeight: 300, color: "#88B8D8", margin: "0 0 8px" }}>What are you working on, Tan?</h1>
              <p style={{ fontSize: 14, color: "#3A6088", margin: "0 0 30px", lineHeight: 1.6 }}>{pet} is running around! Ask anything about Indian or foreign law.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 500, margin: "0 auto" }}>
                {[
                  { q: "Explain Basic Structure doctrine after Kesavananda Bharati with foreign comparisons", icon: "🏛️" },
                  { q: "Moot court arguments on right to privacy under Article 21 post-Puttaswamy", icon: "⚔️" },
                  { q: "Full project on cybercrime under IT Act and BNS with UK/US comparison", icon: "📄" },
                  { q: "Latest SC judgments on environmental protection and Article 48A", icon: "📰" },
                ].map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.q); if (!active) newChat(); setTimeout(() => inputRef.current?.focus(), 150); }}
                    style={{ padding: "14px", background: "rgba(106,170,212,.02)", border: "1px solid rgba(106,170,212,.05)", borderRadius: 12, textAlign: "left", fontSize: 13, color: "#6A9CC0", lineHeight: 1.5, transition: "all .25s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(106,170,212,.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(106,170,212,.02)"; e.currentTarget.style.transform = "none"; }}
                  ><span style={{ fontSize: 18, display: "block", marginBottom: 6 }}>{s.icon}</span>{s.q}</button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => <Msg key={`${active}-${i}`} msg={m} onPDF={generatePDF} onAction={p => send("Continue analysis", p)} isStreaming={streaming && i === msgs.length - 1 && m.role === "assistant"} />)}
          {loading && (
            <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 20px", animation: "msgUp .3s ease both" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#0E2A40,#1A3854)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1px solid rgba(106,170,212,.12)" }}>⚖️</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#5A90B0", animation: `lilypulse 1.3s ease ${i * .2}s infinite` }} />)}</div>
                  <span style={{ fontSize: 13, color: "#5A90B0", fontStyle: "italic" }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid rgba(106,170,212,.03)", background: "rgba(6,10,18,.95)", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "rgba(106,170,212,.03)", border: "1px solid rgba(106,170,212,.06)", borderRadius: 16, padding: "4px 4px 4px 16px", transition: "all .3s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(106,170,212,.18)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(106,170,212,.05)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(106,170,212,.06)"; e.currentTarget.style.boxShadow = "none"; }}>
              <textarea ref={inputRef} value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) { let cid = active; if (!cid) cid = newChat(); setTimeout(() => send(input), 50); } } }}
                placeholder="Ask anything, Tan..." rows={1}
                style={{ flex: 1, border: "none", background: "transparent", color: "#A8C8E0", fontSize: 15, lineHeight: 1.6, resize: "none", padding: "8px 0", maxHeight: 120 }} />
              <button onClick={() => { if (input.trim() && !loading && !streaming) { let cid = active; if (!cid) cid = newChat(); setTimeout(() => send(input), 50); } }} disabled={!input.trim() || loading || streaming}
                style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: input.trim() && !loading && !streaming ? "linear-gradient(135deg,#1A3A5A,#2A5070)" : "rgba(106,170,212,.06)", color: input.trim() && !loading && !streaming ? "#C8E0F8" : "#1A3050", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .25s", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 6 }}><span style={{ fontSize: 10, color: "#1A2A3A" }}>Ironclad Jurist can make mistakes. Verify on SCC Online / Manupatra.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}