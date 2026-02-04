"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Task } from "@/lib/db";
import { CheckCircle2, Clock, ExternalLink, PlayCircle, Zap, ChevronRight, Info, Target, Coins } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function EarnPage() {
    const { user, refreshUser } = useUser();
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
            alert(`SUCCESS! +${data.reward} Flow Credits added.`);
            await refreshUser();
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error: any) => {
            alert(error.message);
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
        <div className="animate-fade-in" style={{ padding: '24px 20px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <Zap size={18} color="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                    <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>EARNING OPPORTUNITIES</span>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '8px' }}>Flow Hub</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Maximize your balance by completing premium tasks and verified campaigns.
                </p>
            </div>

            {/* Task Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {tasks.map((task: Task) => (
                    <div key={task.id} className="glass-panel" style={{ padding: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div className="flex-between" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
                            <div className="flex" style={{ gap: '16px' }}>
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    width: '48px', height: '48px',
                                    borderRadius: '14px',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--primary)',
                                    flexShrink: 0
                                }} className="flex-center">
                                    {task.type === "ad" && <PlayCircle size={24} />}
                                    {task.type === "visit" && <ExternalLink size={24} />}
                                    {task.type === "checkin" && <CheckCircle2 size={24} />}
                                    {task.type === "quiz" && <Clock size={24} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{task.title}</h3>
                                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
                                        <Coins size={12} color="var(--success)" />
                                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '800' }}>+{task.reward} FLOW</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => completeTask(task.id)}
                            disabled={completingId === task.id}
                            className="btn"
                            style={{ width: '100%', padding: '14px 0', fontSize: '0.85rem', borderRadius: '14px' }}
                        >
                            {completingId === task.id ? "SYCHRONIZING..." : "START EARNING"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <div className="glass-panel" style={{
                padding: '28px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed var(--glass-border)',
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                <Info size={24} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>
                    New tasks are added every 24 hours. Check back soon for more rewards!
                </p>
                <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    LEARN MORE ABOUT REWARDS <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
}
