"use client";

export const dynamic = 'force-dynamic';

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/db";
import { CheckCircle2, Clock, ExternalLink, PlayCircle, Zap, ChevronRight, Info, Target, Coins } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/context/ToastContext";

export default function EarnPage() {
    const { user, refreshUser, loading } = useUser();
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [completingId, setCompletingId] = useState<string | null>(null);

    // Auth Protection
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', user?.id],
        queryFn: async () => {
            const res = await fetch("/api/tasks", {
                headers: { "x-user-id": user?.id || "" },
            });
            if (!res.ok) throw new Error("Failed to fetch tasks");
            return res.json();
        },
        enabled: !!user,
    });

    const completeTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const res = await fetch("/api/tasks/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || "",
                },
                body: JSON.stringify({ taskId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            return res.json();
        },
        onSuccess: async (data) => {
            showToast(`MISSION SUCCESS! +${data.reward} FLOW ADDED`, "success");
            await refreshUser();
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error: any) => {
            showToast(error.message, "error");
        }
    });

    const completeTask = (taskId: string) => {
        setCompletingId(taskId);
        completeTaskMutation.mutate(taskId, {
            onSettled: () => setCompletingId(null)
        });
    };

    if (loading || !user) return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ color: 'var(--primary)', animation: 'pulse-glow 2s infinite' }}>
                <Target size={40} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.05em' }}>VERIFYING CREDENTIALS...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px', paddingBottom: '120px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '48px', position: 'relative' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '4px', borderRadius: '4px', background: 'var(--emerald-glow)' }}>
                        <Target size={18} color="var(--emerald)" strokeWidth={1.5} />
                    </div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '4px' }}>OPERATIONAL FLOW</span>
                </div>
                <h1 className="font-heading" style={{ fontSize: '3.2rem', fontWeight: '950', letterSpacing: '-4px', marginBottom: '8px', lineHeight: 1.1 }}>Flow Center</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.5px', lineHeight: '1.6', width: '99%', maxWidth: 'var(--max-width)' }}>
                    Execute verified protocols to scale your portfolio. Global mission parameters are optimized for high-volume acquisition.
                </p>
                {/* Subtle Decorative Glow */}
                <div style={{ position: 'absolute', top: '0', right: '0', width: '200px', height: '100px', background: 'var(--emerald)', filter: 'blur(100px)', opacity: 0.1 }} />
            </div>

            {/* Task Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                {tasks.map((task: Task) => (
                    <div key={task.id} className="glass-panel glass-vibrant" style={{
                        padding: '40px',
                        border: '1.5px solid var(--emerald)',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #065f46 0%, #020617 100%)',
                        display: 'flex', flexDirection: 'column', gap: '32px',
                        transition: 'all 0.5s var(--transition)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)'
                    }}>
                        <div className="flex" style={{ gap: '28px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                            <div style={{
                                width: '80px', height: '80px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                                flexShrink: 0
                            }} className="flex-center">
                                {task.type === "ad" && <PlayCircle size={32} strokeWidth={2} />}
                                {task.type === "visit" && <ExternalLink size={32} strokeWidth={2} />}
                                {task.type === "checkin" && <CheckCircle2 size={32} strokeWidth={2} />}
                                {task.type === "quiz" && <Clock size={32} strokeWidth={2} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="flex" style={{ flexDirection: 'column', gap: '4px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', letterSpacing: '1px' }}>{task.title.toUpperCase()}</h3>
                                    {task.reward >= 100 && <div className="badge-gold" style={{ fontSize: '0.55rem', alignSelf: 'flex-start' }}>HIGH REWARD NODE</div>}
                                </div>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginTop: '12px' }}>
                                    <span style={{ color: 'var(--emerald)', fontSize: '1.75rem', fontWeight: '950', letterSpacing: '-2px' }}>{task.reward.toLocaleString()}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '950', letterSpacing: '2px', marginTop: '4px' }}>FLOW CAPITAL</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => completeTask(task.id)}
                            disabled={completingId === task.id}
                            className="btn"
                            style={{
                                width: '100%',
                                height: '72px',
                                fontSize: '0.9rem',
                                borderRadius: '16px',
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                fontWeight: '950',
                                letterSpacing: '4px',
                                boxShadow: '0 15px 30px rgba(255,255,255,0.2)'
                            }}
                        >
                            {completingId === task.id ? "EXECUTING PROTOCOL..." : "EXECUTE MISSION"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Platform Information */}
            <div className="glass-panel" style={{
                padding: '48px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid #222',
                textAlign: 'center',
                borderRadius: '4px'
            }}>
                <Info size={32} color="var(--text-dim)" strokeWidth={1} style={{ marginBottom: '24px' }} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '24px' }}>
                    MISSION PARAMETERS REFRESH AT 00:00 UTC.
                </p>
                <div style={{ color: '#fff', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '2px' }}>
                    REVIEW OPERATION GUIDELINES <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
}
