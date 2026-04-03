import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");

  // 로그인 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 데이터 가져오기
  useEffect(() => {
    if (session) fetchAccounts();
  }, [session]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase.from("accounts").select("*");

    if (!error) setAccounts(data);
  };

  // 고객 추가
  const addAccount = async () => {
    if (!name) return;

    const { error } = await supabase.from("accounts").insert({ name });

    if (!error) {
      setName("");
      fetchAccounts();
    }
  };

  // 로그인
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) alert(error.message);
  };

  // 회원가입
  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) alert(error.message);
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div>로딩중...</div>;

  // 로그인 안된 상태
  if (!session) {
    return (
      <div style={{ padding: 40 }}>
        <h2>팀 CRM 로그인</h2>

        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <button onClick={signIn}>로그인</button>
        <button onClick={signUp}>회원가입</button>
      </div>
    );
  }

  // 로그인 된 상태
  return (
    <div style={{ padding: 40 }}>
      <h1>CRM</h1>

      <button onClick={signOut}>로그아웃</button>

      <h3>고객 추가</h3>
      <input
        placeholder="고객명"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addAccount}>추가</button>

      <h3>고객 목록</h3>
      <ul>
        {accounts.map((a) => (
          <li key={a.id}>{a.name}</li>
        ))}
      </ul>
    </div>
  );
}
