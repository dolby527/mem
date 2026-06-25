"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  listHospitalMembers,
  type HospitalMember,
} from "@/lib/api/users.api";
import { useAuth } from "@/providers/AuthProvider";
import { MemberRow } from "./MemberRow";
import { PaginationBar } from "./PaginationBar";
import { UserModals } from "./UserModals";
import * as pageStyles from "./managePage.css";
import * as table from "./manageUsers.css";

const PAGE_SIZE = 6;

function ManageUsersInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") ?? "";
  const { user } = useAuth();
  const [draft, setDraft] = useState(nameParam);
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleMember, setRoleMember] = useState<HospitalMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<HospitalMember | null>(null);
  const [members, setMembers] = useState<HospitalMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prevNameParam, setPrevNameParam] = useState(nameParam);

  if (prevNameParam !== nameParam) {
    setPrevNameParam(nameParam);
    setDraft(nameParam);
    setPage(1);
  }

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listHospitalMembers();
      setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "HOSPITAL_ADMIN") {
      router.replace("/unauthorized");
      return;
    }
    void loadMembers();
  }, [user, router, loadMembers, reloadKey]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const scheduleSearchReplace = useCallback(
    (q: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        const next = new URLSearchParams(searchParams.toString());
        if (q.trim()) next.set("name", q.trim());
        else next.delete("name");
        const qs = next.toString();
        router.replace(qs ? `/settings/users?${qs}` : "/settings/users");
      }, 350);
    },
    [router, searchParams],
  );

  const filtered = useMemo(() => {
    const t = nameParam.trim().toLowerCase();
    if (!t) return members;
    return members.filter((m) => m.name.toLowerCase().includes(t));
  }, [members, nameParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  if (page > totalPages) {
    setPage(1);
  }

  const slice = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const rowPlaceholderCount = Math.max(0, PAGE_SIZE - slice.length);

  if (user?.role !== "HOSPITAL_ADMIN") {
    return null;
  }

  return (
    <>
      <UserModals
        inviteOpen={inviteOpen}
        setInviteOpen={setInviteOpen}
        roleMember={roleMember}
        setRoleMember={setRoleMember}
        deleteMember={deleteMember}
        setDeleteMember={setDeleteMember}
        onMembersChanged={() => setReloadKey((k) => k + 1)}
      />

      <div className={`${pageStyles.managePage} ${table.usersManagePage}`}>
        <div className={pageStyles.pageHead}>
          <div className={table.pageTitleRow}>
            <h1 className={pageStyles.pageTitle}>사용자 관리</h1>
            <button
              type="button"
              className={table.inviteLinkBtn}
              onClick={() => setInviteOpen(true)}
            >
              + 사용자 초대
            </button>
          </div>
          <div
            className={`${pageStyles.toolbarCluster} ${table.usersToolbar}`}
          >
            <div
              className={`${pageStyles.searchWrap} ${pageStyles.searchWrapFlex} ${table.usersSearchWrap}`}
            >
              <span className={pageStyles.searchIcon} aria-hidden>
                🔍
              </span>
              <input
                type="search"
                className={pageStyles.searchInput}
                placeholder="이름으로 검색하세요"
                value={draft}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft(v);
                  scheduleSearchReplace(v);
                }}
                aria-label="이름으로 검색"
              />
            </div>
            <button
              type="button"
              className={table.inviteDesktopBtn}
              onClick={() => setInviteOpen(true)}
            >
              사용자 초대하기
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={pageStyles.contentGrow}>
            <p
              className={`${pageStyles.mutedBody} ${pageStyles.loadingTop}`}
            >
              불러오는 중…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={pageStyles.contentGrow}>
            <div className={pageStyles.emptyWrap}>
              <div className={pageStyles.emptyArt} aria-hidden>
                👥
              </div>
              <h2 className={pageStyles.emptyTitle}>등록된 사용자가 없어요</h2>
              <p className={pageStyles.emptySub}>
                병원 구성원을 초대하고
                <br />
                MEM에서 함께 장비를 관리하세요
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`${pageStyles.contentGrow} ${table.usersContentGrow}`}
          >
            <div className={table.tableHeader} role="row">
              <div role="columnheader">이름</div>
              <div role="columnheader">메일</div>
              <div role="columnheader">권한</div>
              <div
                role="columnheader"
                className={table.tableHeaderNote}
              >
                비고
              </div>
            </div>

            <div className={table.usersListArea}>
              <div className={table.memberList}>
                {slice.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    currentUserId={user.id}
                    onDelete={() => setDeleteMember(m)}
                    onChangeRole={() => setRoleMember(m)}
                  />
                ))}
                {Array.from({ length: rowPlaceholderCount }, (_, i) => (
                  <MemberRow key={`placeholder-${String(i)}`} placeholder />
                ))}
              </div>
            </div>

            <PaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              size="large"
              mode="all"
              className={table.usersPagination}
            />
          </div>
        )}
      </div>
    </>
  );
}

export function ManageUsers() {
  return (
    <Suspense
      fallback={<p className={pageStyles.mutedBody}>불러오는 중…</p>}
    >
      <ManageUsersInner />
    </Suspense>
  );
}
