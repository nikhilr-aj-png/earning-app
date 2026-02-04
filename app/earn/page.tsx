"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Task } from "@/lib/db";
import { CheckCircle2, Clock, ExternalLink, PlayCircle, Zap, ChevronRight, Info, Target, Coins } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/context/ToastContext";

export default function EarnPage() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [completingId, setCompletingId] = useState<string | null>(null);

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

    if (isLoading) return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ color: 'var(--primary)', animation: 'pulse-glow 2s infinite' }}>
                <Target size={40} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.05em' }}>LOADING ASSETS...</p>
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
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.5px', lineHeight: '1.6', maxWidth: '500px' }}>
                    Execute verified protocols to scale your portfolio. Global mission parameters are optimized for high-volume acquisition.
                </p>
                {/* Subtle Decorative Glow */}
                <div style={{ position: 'absolute', top: '0', right: '0', width: '200px', height: '100px', background: 'var(--emerald)', filter: 'blur(100px)', opacity: 0.1 }} />
            </div>

            {/* Task Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                {tasks.map((task: Task) => (
                    <div key={task.id} className="glass-panel" style={{
                        padding: '32px',
                        border: '1px solid #111',
                        borderRadius: '12px',
                        background: 'rgba(5,5,5,0.8)',
                        display: 'flex', flexDirection: 'column', gap: '28px',
                        transition: 'all 0.5s var(--transition)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="flex" style={{ gap: '24px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                            <div style={{
                                width: '64px', height: '64px',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.02)',
                                color: 'var(--emerald)',
                                flexShrink: 0
                            }} className="flex-center">
                                {task.type === "ad" && <PlayCircle size={24} strokeWidth={1.5} />}
                                {task.type === "visit" && <ExternalLink size={24} strokeWidth={1.5} />}
                                {task.type === "checkin" && <CheckCircle2 size={24} strokeWidth={1.5} />}
                                {task.type === "quiz" && <Clock size={24} strokeWidth={1.5} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: '950', color: '#fff', letterSpacing: '0.5px' }}>{task.title.toUpperCase()}</h3>
                                    {task.reward >= 100 && <span className="badge-gold" style={{ fontSize: '0.5rem', padding: '1px 6px', borderRadius: '2px' }}>HIGH REWARD</span>}
                                </div>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)' }} />
                                    <span style={{ color: 'var(--emerald)', fontSize: '1.25rem', fontWeight: '950', letterSpacing: '-1px' }}>{task.reward.toLocaleString()}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px', marginTop: '4px' }}>FLOW CREDIT</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => completeTask(task.id)}
                            disabled={completingId === task.id}
                            className="btn"
                            style={{
                                width: '100%',
                                height: '64px',
                                fontSize: '0.8rem',
                                borderRadius: '8px',
                                background: 'var(--emerald)',
                                color: '#000',
                                border: 'none',
                                fontWeight: '950',
                                letterSpacing: '3px',
                                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.1)'
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
