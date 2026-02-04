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
            <div style={{ marginBottom: '48px' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                    <Target size={18} color="#fff" strokeWidth={1} />
                    <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px' }}>OPERATIONAL TASKS</span>
                </div>
                <h1 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '8px' }}>Flow Center</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '1px', lineHeight: '1.6' }}>
                    Execute high-priority missions to acquire verified Flow Credits.
                </p>
            </div>

            {/* Task Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                {tasks.map((task: Task) => (
                    <div key={task.id} className="glass-panel" style={{
                        padding: '32px',
                        border: '1px solid #222',
                        borderRadius: '4px',
                        background: '#000',
                        display: 'flex', flexDirection: 'column', gap: '24px'
                    }}>
                        <div className="flex" style={{ gap: '24px', alignItems: 'center' }}>
                            <div style={{
                                width: '56px', height: '56px',
                                borderRadius: '2px',
                                border: '1px solid #333',
                                color: '#fff',
                                flexShrink: 0
                            }} className="flex-center">
                                {task.type === "ad" && <PlayCircle size={28} strokeWidth={1} />}
                                {task.type === "visit" && <ExternalLink size={28} strokeWidth={1} />}
                                {task.type === "checkin" && <CheckCircle2 size={28} strokeWidth={1} />}
                                {task.type === "quiz" && <Clock size={28} strokeWidth={1} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#fff', marginBottom: '4px', letterSpacing: '1px' }}>{task.title.toUpperCase()}</h3>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '900' }}>{task.reward}</span>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '2px' }}>FLOW</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => completeTask(task.id)}
                            disabled={completingId === task.id}
                            className="btn"
                            style={{
                                width: '100%',
                                height: '56px',
                                fontSize: '0.75rem',
                                borderRadius: '2px',
                                background: '#fff',
                                color: '#000',
                                fontWeight: '900',
                                letterSpacing: '2px'
                            }}
                        >
                            {completingId === task.id ? "EXECUTING MISSION..." : "START OPERATION"}
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
