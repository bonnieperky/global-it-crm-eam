import React, { useEffect, useState } from "react";
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
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("고객 목록을 불러오지 못했어요.");
      return;
    }

    const mapped = (data || []).map((item) => ({
      ...item,
      nextAction: item.next_action || "",
      meetingLink: item.meeting_link || "",
      tags: Array.isArray(item.tags) ? item.tags : []
    }));

    setAccounts(mapped);
    if (mapped.length > 0) {
      setSelectedId(mapped[0].id);
    } else {
      setSelectedId(null);
    }
  };

  const selected = accounts.find((a) => a.id === selectedId) || null;

  const saveAccount = async () => {
    if (!form.name.trim()) {
      alert("고객명을 입력해 주세요.");
      return;
    }

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
      tags: String(form.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    };

    const { error } = await supabase.from("accounts").insert(payload);

    if (error) {
      alert("저장에 실패했어요.");
      return;
    }

    setForm(initialForm);
    setShowForm(false);
    fetchAccounts();
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    }
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      alert("회원가입이 완료됐어요.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div style={{ padding: 40 }}>
        <h2>팀 CRM 로그인</h2>
        <div style={{ marginBottom: 12 }}>
          <input
            style={{ padding: 8, width: 260 }}
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            style={{ padding: 8, width: 260 }}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleSignIn} style={{ marginRight: 8 }}>
          로그인
        </button>
        <button onClick={handleSignUp}>회원가입</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1>CRM</h1>
      <button onClick={handleSignOut}>로그아웃</button>
      <button onClick={() => setShowForm(true)} style={{ marginLeft: 8 }}>
        고객 추가
      </button>

      {showForm && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8
          }}
        >
          <h3>새 고객 등록</h3>

          <div style={{ marginBottom: 10 }}>
            <input
              style={{ width: 300, padding: 8 }}
              placeholder="고객명"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              style={{ width: 300, padding: 8, marginRight: 8 }}
              placeholder="Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
            <input
              style={{ width: 300, padding: 8 }}
              placeholder="Industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <select
              style={{ width: 150, padding: 8, marginRight: 8 }}
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
            >
              <option>초기검토</option>
              <option>접촉중</option>
              <option>제안준비</option>
              <option>협의중</option>
              <option>종료</option>
            </select>

            <select
              style={{ width: 150, padding: 8 }}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <textarea
              style={{ width: 620, height: 70, padding: 8 }}
              placeholder="핵심 니즈"
              value={form.needs}
              onChange={(e) => setForm({ ...form, needs: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <textarea
              style={{ width: 620, height: 70, padding: 8 }}
              placeholder="경쟁사"
              value={form.competitors}
              onChange={(e) => setForm({ ...form, competitors: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <textarea
              style={{ width: 620, height: 70, padding: 8 }}
              placeholder="주요 솔루션 설명"
              value={form.solutions}
              onChange={(e) => setForm({ ...form, solutions: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              style={{ width: 300, padding: 8, marginRight: 8 }}
              placeholder="주요 컨택"
              value={form.contacts}
              onChange={(e) => setForm({ ...form, contacts: e.target.value })}
            />
            <input
              style={{ width: 300, padding: 8 }}
              placeholder="다음 액션"
              value={form.nextAction}
              onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              style={{ width: 620, padding: 8 }}
              placeholder="회의록 링크 (공유 드라이브 URL)"
              value={form.meetingLink}
              onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <textarea
              style={{ width: 620, height: 70, padding: 8 }}
              placeholder="현황 메모"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <input
              style={{ width: 620, padding: 8 }}
              placeholder="태그 (쉼표로 구분)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <button onClick={saveAccount} style={{ marginRight: 8 }}>
            저장
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setForm(initialForm);
            }}
          >
            취소
          </button>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h3>고객 목록</h3>
        {accounts.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelectedId(a.id)}
            style={{
              padding: 10,
              marginBottom: 8,
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              background: selectedId === a.id ? "#f3f4f6" : "#fff"
            }}
          >
            <strong>{a.name}</strong>
            <div style={{ color: "#666", fontSize: 14 }}>
              {a.region} · {a.industry}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          style={{
            marginTop: 30,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8
          }}
        >
          <h2>{selected.name}</h2>
          <div style={{ marginBottom: 12 }}>
            {selected.region} · {selected.industry}
          </div>

          <p><strong>핵심 니즈:</strong> {selected.needs}</p>
          <p><strong>경쟁사:</strong> {selected.competitors}</p>
          <p><strong>주요 솔루션 설명:</strong> {selected.solutions}</p>
          <p><strong>주요 컨택:</strong> {selected.contacts}</p>
          <p><strong>다음 액션:</strong> {selected.nextAction}</p>
          <p><strong>현황 메모:</strong> {selected.notes}</p>

          <p>
            <strong>회의록 링크:</strong>{" "}
            {selected.meetingLink ? (
              <a href={selected.meetingLink} target="_blank" rel="noreferrer">
                링크 열기
              </a>
            ) : (
              "없음"
            )}
          </p>
        </div>
      )}
    </div>
  );
}
