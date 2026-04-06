import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const initialForm = {
  name: "",
  region: "",
  industry: "",
  owner: "",
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    color: "#0f172a"
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto"
  },
  header: {
    background: "#ffffff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
    marginBottom: 20
  },
  h1: {
    margin: "8px 0 8px",
    fontSize: 32
  },
  p: {
    margin: 0,
    color: "#475569"
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 20
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)"
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 20
  },
  panel: {
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    marginBottom: 10,
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    minHeight: 84,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    marginBottom: 10,
    boxSizing: "border-box",
    resize: "vertical"
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    marginBottom: 10,
    boxSizing: "border-box"
  },
  button: {
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    marginRight: 8
  },
  lightButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    marginRight: 8
  },
  dangerButton: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer"
  },
  accountItem: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    cursor: "pointer"
  },
  activeItem: {
    border: "1px solid #111827",
    background: "#f8fafc"
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginRight: 6,
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: 700
  },
  detailBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    background: "#fff"
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  authWrap: {
    maxWidth: 420,
    margin: "60px auto",
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)"
  }
};

function stageColor(stage) {
  if (stage === "접촉중") return { background: "#dbeafe", color: "#1d4ed8" };
  if (stage === "제안준비") return { background: "#fef3c7", color: "#b45309" };
  if (stage === "계약") return { background: "#ede9fe", color: "#6d28d9" };
  if (stage === "종료") return { background: "#dcfce7", color: "#15803d" };
  return { background: "#e2e8f0", color: "#334155" };
}

function priorityColor(priority) {
  if (priority === "High") return { background: "#fee2e2", color: "#b91c1c" };
  if (priority === "Medium") return { background: "#fef3c7", color: "#b45309" };
  return { background: "#e2e8f0", color: "#334155" };
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("전체");
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

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

    const mapped = (data || []).map((item) => ({
      ...item,
      nextAction: item.next_action || "",
      meetingLink: item.meeting_link || "",
      tags: Array.isArray(item.tags) ? item.tags : []
    }));

    setAccounts(mapped);
    if (mapped.length > 0) {
      setSelectedId((prev) => prev || mapped[0].id);
    } else {
      setSelectedId(null);
    }
  };

const filtered = useMemo(() => {
  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  return accounts
    .filter((a) => {
      const matchesStage = stageFilter === "전체" || a.stage === stageFilter;

      const haystack = [
        a.name,
        a.region,
        a.industry,
        a.owner,
        a.needs,
        a.competitors,
        a.solutions,
        a.contacts,
        a.notes,
        ...(a.tags || [])
      ]
        .join(" ")
        .toLowerCase();

      return matchesStage && haystack.includes(query.toLowerCase());
    })
.sort((a, b) => {
  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const stageOrder = {
    계약: 5,
    제안준비: 4,
    접촉중: 3,
    초기검토: 2,
    종료: 1
  };

  // 1️⃣ Priority 비교
  const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
  if (priorityDiff !== 0) return priorityDiff;

  // 2️⃣ Stage 비교
  const stageDiff = (stageOrder[b.stage] || 0) - (stageOrder[a.stage] || 0);
  if (stageDiff !== 0) return stageDiff;

  // 3️⃣ 동일하면 최신순
  return new Date(b.created_at) - new Date(a.created_at);
});
}, [accounts, query, stageFilter]);

  const selected = filtered.find((a) => a.id === selectedId) || filtered[0] || null;

  const highPriorityCount = accounts.filter((a) => a.priority === "High").length;
  const activeCount = accounts.filter((a) =>
    ["접촉중", "제안준비", "계약"].includes(a.stage)
  ).length;

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (account) => {
    setEditId(account.id);
    setForm({
      name: account.name || "",
      region: account.region || "",
      industry: account.industry || "",
      owner: account.owner || "",
      stage: account.stage || "초기검토",
      priority: account.priority || "Medium",
      needs: account.needs || "",
      competitors: account.competitors || "",
      solutions: account.solutions || "",
      contacts: account.contacts || "",
      notes: account.notes || "",
      meetingLink: account.meetingLink || account.meeting_link || "",
      nextAction: account.nextAction || "",
      tags: Array.isArray(account.tags) ? account.tags.join(", ") : ""
    });
    setShowForm(true);
  };

  const saveAccount = async () => {
    if (!form.name.trim()) {
      alert("고객명은 꼭 입력해줘야 해요.");
      return;
    }

    const normalizedTags = String(form.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      region: form.region,
      industry: form.industry,
      owner: form.owner,
      stage: form.stage,
      priority: form.priority,
      needs: form.needs,
      competitors: form.competitors,
      solutions: form.solutions,
      contacts: form.contacts,
      notes: form.notes,
      meeting_link: form.meetingLink,
      next_action: form.nextAction,
      tags: normalizedTags
    };

    let error = null;

    if (editId) {
      const result = await supabase.from("accounts").update(payload).eq("id", editId);
      error = result.error;
    } else {
      const result = await supabase.from("accounts").insert(payload);
      error = result.error;
    }

    if (error) {
      alert("저장에 실패했어요.");
      return;
    }

    await fetchAccounts();
    resetForm();
    setShowForm(false);
  };

  const deleteAccount = async (id) => {
    const target = accounts.find((account) => account.id === id);
    const ok = window.confirm(`${target?.name || "이 고객"} 정보를 삭제할까요?`);
    if (!ok) return;

    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) {
      alert("삭제에 실패했어요.");
      return;
    }

    await fetchAccounts();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(accounts, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "global-it-crm-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) throw new Error("invalid");

        const rows = parsed.map((item) => ({
          name: item.name || "",
          region: item.region || "",
          industry: item.industry || "",
          owner: item.owner || "",
          stage: item.stage || "초기검토",
          priority: item.priority || "Medium",
          needs: item.needs || "",
          competitors: item.competitors || "",
          solutions: item.solutions || "",
          contacts: item.contacts || "",
          notes: item.notes || "",
          next_action: item.nextAction || item.next_action || "",
          tags: Array.isArray(item.tags) ? item.tags : []
        }));

        const { error } = await supabase.from("accounts").insert(rows);

        if (error) {
          alert("데이터 불러오기에 실패했어요.");
          return;
        }

        await fetchAccounts();
        alert("데이터를 불러왔어요.");
      } catch (err) {
        alert("JSON 파일 형식이 올바르지 않아요.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
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

  if (loading) {
    return <div style={{ padding: 24 }}>로딩 중...</div>;
  }

  if (!session) {
    return (
      <div style={styles.page}>
        <div style={styles.authWrap}>
          <h2 style={{ marginTop: 0 }}>팀 CRM 로그인</h2>
          <input
            style={styles.input}
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            style={styles.input}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button style={styles.button} onClick={handleSignIn}>
            로그인
          </button>
          <button style={styles.lightButton} onClick={handleSignUp}>
            회원가입
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div style={{ color: "#64748b", fontSize: 14 }}>Global Account CRM</div>
              <h1 style={styles.h1}>글로벌 IT 고객 관리 미니 CRM</h1>
              <p style={styles.p}>
                핵심 니즈, 경쟁사, 솔루션, 컨택 현황, 다음 액션을 한 화면에서 정리하는 간단한 내부용 툴
              </p>
            </div>
            <div>
              <button style={styles.button} onClick={startCreate}>
                고객 추가
              </button>
              <button style={styles.lightButton} onClick={exportData}>
                데이터 내보내기
              </button>
              <label style={{ ...styles.lightButton, display: "inline-block" }}>
                데이터 불러오기
                <input
                  type="file"
                  accept="application/json"
                  onChange={importData}
                  style={{ display: "none" }}
                />
              </label>
              <button style={styles.lightButton} onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div style={{ ...styles.panel, marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>{editId ? "고객 정보 수정" : "새 고객 등록"}</h3>

            <div style={styles.grid2}>
              <input
                style={styles.input}
                placeholder="고객명"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Region"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Industry"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Owner"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
              <select
                style={styles.select}
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                <option>초기검토</option>
                <option>접촉중</option>
                <option>제안준비</option>
                <option>계약</option>
                <option>종료</option>
              </select>
              <select
                style={styles.select}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <textarea
              style={styles.textarea}
              placeholder="핵심 니즈"
              value={form.needs}
              onChange={(e) => setForm({ ...form, needs: e.target.value })}
            />
            <textarea
              style={styles.textarea}
              placeholder="경쟁사"
              value={form.competitors}
              onChange={(e) => setForm({ ...form, competitors: e.target.value })}
            />
            <textarea
              style={styles.textarea}
              placeholder="주요 솔루션 설명"
              value={form.solutions}
              onChange={(e) => setForm({ ...form, solutions: e.target.value })}
            />

            <div style={styles.grid2}>
              <input
                style={styles.input}
                placeholder="담당자"
                value={form.contacts}
                onChange={(e) => setForm({ ...form, contacts: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="다음 액션"
                value={form.nextAction}
                onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              />
            </div>

                  <input
  style={styles.input}
  placeholder="회의록 링크 (공유 드라이브 URL)"
  value={form.meetingLink}
  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
/>
            <textarea
              style={styles.textarea}
              placeholder="메모 / 현황"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="태그 (쉼표로 구분)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            <button style={styles.button} onClick={saveAccount}>
              {editId ? "수정 저장" : "저장"}
            </button>
            <button
              style={styles.lightButton}
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              취소
            </button>
          </div>
        )}

        <div style={styles.metrics}>
          <div style={styles.card}>
            <div style={{ color: "#64748b", fontSize: 14 }}>전체 고객</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{accounts.length}</div>
          </div>
          <div style={styles.card}>
            <div style={{ color: "#64748b", fontSize: 14 }}>High Priority</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{highPriorityCount}</div>
          </div>
          <div style={styles.card}>
            <div style={{ color: "#64748b", fontSize: 14 }}>진행 중 계정</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{activeCount}</div>
          </div>
        </div>

        <div style={styles.layout}>
          <div style={styles.panel}>
            <h3 style={{ marginTop: 0 }}>고객 목록</h3>
            <input
              style={styles.input}
              placeholder="고객명, 니즈, 경쟁사, 태그 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              style={styles.select}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option>전체</option>
              <option>초기검토</option>
              <option>접촉중</option>
              <option>제안준비</option>
              <option>계약</option>
              <option>종료</option>
            </select>

            {filtered.length === 0 ? (
              <div style={{ color: "#64748b" }}>검색 결과가 없습니다.</div>
            ) : (
              filtered.map((account) => (
                <div
                  key={account.id}
                  style={{
                    ...styles.accountItem,
                    ...(selected && selected.id === account.id ? styles.activeItem : {})
                  }}
                  onClick={() => setSelectedId(account.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                   <div>
  <div style={{ fontWeight: 700 }}>{account.name}</div>
  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
    {account.region || "-"} · {account.industry || "-"}
  </div>
</div>
   


                {stageItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setSelectedId(item.id)}
                        style={{
                          background: "#fff",
                          borderRadius: 14,
                          padding: 12,
                          marginBottom: 10,
                          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)",
                          cursor: "pointer",
                          ...provided.draggableProps.style
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                          {item.region || "-"} · {item.industry || "-"}
                        </div>
                        <div>
                          <span style={{ ...styles.badge, ...priorityColor(item.priority) }}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })}
    </div>
  </DragDropContext>
</div>
                    <span style={{ ...styles.badge, ...priorityColor(account.priority) }}>
                      {account.priority}
                    </span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span style={{ ...styles.badge, ...stageColor(account.stage) }}>
                      {account.stage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.panel}>
            {selected ? (
              <>
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    flexWrap: "wrap"
                  }}
                >
                  <button style={styles.lightButton} onClick={() => startEdit(selected)}>
                    수정
                  </button>
                  <button style={styles.dangerButton} onClick={() => deleteAccount(selected.id)}>
                    삭제
                  </button>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ margin: 0 }}>{selected.name}</h2>
                  <div style={{ color: "#64748b", marginTop: 8 }}>
                    {selected.region} · {selected.industry} · Owner: {selected.owner}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span style={{ ...styles.badge, ...stageColor(selected.stage) }}>
                      {selected.stage}
                    </span>
                    <span style={{ ...styles.badge, ...priorityColor(selected.priority) }}>
                      {selected.priority}
                    </span>
                  </div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.sectionTitle}>핵심 니즈</div>
                 <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.needs}</div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.sectionTitle}>경쟁사</div>
                 <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.competitors}</div>
                </div>

                <div style={styles.detailBox}>
                  <div style={styles.sectionTitle}>주요 솔루션 설명</div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.solutions}</div>
                </div>

                <div style={styles.grid2}>
                  <div style={styles.detailBox}>
                    <div style={styles.sectionTitle}>담당자</div>
               <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.contacts}</div>
                  </div>
                  <div style={styles.detailBox}>
                    <div style={styles.sectionTitle}>다음 액션</div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.nextAction}</div>
                  </div>
                </div>
<div style={styles.detailBox}>
  <div style={styles.sectionTitle}>회의록 링크</div>
  {selected.meetingLink ? (
    <a
      href={selected.meetingLink}
      target="_blank"
      rel="noreferrer"
      style={{ color: "#2563eb", textDecoration: "underline" }}
    >
      회의록 열기
    </a>
  ) : (
    <div style={{ color: "#94a3b8" }}>등록된 링크가 없습니다.</div>
  )}
</div>
                      
                <div style={styles.detailBox}>
                  <div style={styles.sectionTitle}>현황 메모</div>
                 <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.notes}</div>
                  <div style={{ marginTop: 12 }}>
                    {(selected.tags || []).map((tag) => (
                      <span
                        key={tag}
                        style={{ ...styles.badge, background: "#e2e8f0", color: "#334155" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>왼쪽에서 고객을 선택하세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
