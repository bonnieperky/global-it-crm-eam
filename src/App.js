import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const initialForm = {
  name: "",
  region: "",
  industry: "",
  stage: "초기검토",
  priority: "Medium",
  needs: "",
  competitors: "",
  solutions: "",
  contacts: "",
  notes: "",
  meetingLink: "",
  nextAction: "",
  tags: ""
};

export default function App() {
  const [session, setSession] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  useEffect(() => {
    if (session) fetchAccounts();
  }, [session]);

  const fetchAccounts = async () => {
    const { data } = await supabase.from("accounts").select("*");

    const mapped = (data || []).map((item) => ({
      ...item,
      nextAction: item.next_action || "",
      meetingLink: item.meeting_link || "",
      tags: item.tags || []
    }));

    setAccounts(mapped);
    if (mapped.length > 0) setSelectedId(mapped[0].id);
  };

  const selected = accounts.find((a) => a.id === selectedId);

  const saveAccount = async () => {
    const payload = {
      name: form.name,
      region: form.region,
      industry: form.industry,
      stage: form.stage,
      priority: form.priority,
      needs: form.needs,
      competitors: form.competitors,
      solutions: form.solutions,
      contacts: form.contacts,
      notes: form.notes,
      meeting_link: form.meetingLink,
      next_action: form.nextAction,
      tags: form.tags.split(",").map((t) => t.trim())
    };

    await supabase.from("accounts").insert(payload);

    setShowForm(false);
    setForm(initialForm);
    fetchAccounts();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({ email, password });
    window.location.reload();
  };

  const handleSignUp = async () => {
    await supabase.auth.signUp({ email, password });
    alert("회원가입 완료");
  };

  if (!session) {
    return (
      <div style={{ padding: 40 }}>
        <h2>로그인</h2>
        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="pw"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignIn}>로그인</button>
        <button onClick={handleSignUp}>회원가입</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>CRM</h1>

      <button onClick={() => setShowForm(true)}>고객 추가</button>

      {showForm && (
        <div style={{ marginTop: 20 }}>
          <input placeholder="고객명" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Region" onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input placeholder="Industry" onChange={(e) => setForm({ ...form, industry: e.target.value })} />

          <textarea placeholder="핵심 니즈" onChange={(e) => setForm({ ...form, needs: e.target.value })} />
          <textarea placeholder="경쟁사" onChange={(e) => setForm({ ...form, competitors: e.target.value })} />
          <textarea placeholder="솔루션" onChange={(e) => setForm({ ...form, solutions: e.target.value })} />

          <input placeholder="주요 컨택" onChange={(e) => setForm({ ...form, contacts: e.target.value })} />
          <input placeholder="다음 액션" onChange={(e) => setForm({ ...form, nextAction: e.target.value })} />

          <input
            placeholder="회의록 링크"
            onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
          />

          <textarea placeholder="메모" onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <button onClick={saveAccount}>저장</button>
        </div>
      )}

      <h3>고객 목록</h3>
      {accounts.map((a) => (
        <div key={a.id} onClick={() => setSelectedId(a.id)}>
          {a.name}
        </div>
      ))}

      {selected && (
        <div style={{ marginTop: 30 }}>
          <h2>{selected.name}</h2>
          <div>{selected.region} · {selected.industry}</div>

          <p><b>니즈:</b> {selected.needs}</p>
          <p><b>경쟁사:</b> {selected.competitors}</p>
          <p><b>솔루션:</b> {selected.solutions}</p>
          <p><b>컨택:</b> {selected.contacts}</p>
          <p><b>다음 액션:</b> {selected.nextAction}</p>

          <p>
            <b>회의록:</b>{" "}
            {selected.meetingLink ? (
              <a href={selected.meetingLink} target="_blank">링크 열기</a>
            ) : (
              "없음"
            )}
          </p>

          <p><b>메모:</b> {selected.notes}</p>
        </div>
      )}
    </div>
  );
}
