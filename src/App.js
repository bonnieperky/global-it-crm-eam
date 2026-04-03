import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
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

    setAccounts(data || []);
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) alert(error.message);
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      alert(error.message);
    } else {
      alert("회원가입 요청 완료");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addAccount = async () => {
    if (!name.trim()) return;

    const { error } = await supabase.from("accounts").insert({
      name: name
    });

    if (error) {
      alert("고객 추가 실패");
      return;
    }

    setName("");
    fetchAccounts();
  };

  if (loading) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  if (!session) {
    return (
      <div style={{ padding: 40 }}>
        <h2>팀 CRM 로그인</h2>
        <input
          style={{ display: "block", marginBottom: 10, padding: 8 }}
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          style={{ display: "block", marginBottom: 10, padding: 8 }}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={signIn} style={{ marginRight: 8 }}>
          로그인
        </button>
        <button onClick={signUp}>회원가입</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>CRM</h1>
      <button onClick={signOut}>로그아웃</button>

      <h3 style={{ marginTop: 24 }}>고객 추가</h3>
      <input
        style={{ marginRight: 8, padding: 8 }}
        placeholder="고객명"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addAccount}>추가</button>

      <h3 style={{ marginTop: 24 }}>고객 목록</h3>
      <ul>
        {accounts.map((a) => (
          <li key={a.id}>{a.name}</li>
        ))}
      </ul>
    </div>
  );
}
