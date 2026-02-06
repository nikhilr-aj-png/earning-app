"use client";

export const dynamic = 'force-dynamic';

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, ExternalLink, PlayCircle, Zap, ChevronRight, Info, Target, Coins, Timer, AlertTriangle, X, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export interface Task {
    id: string;
    title: string;
    reward: number;
    type: 'visit' | 'ad' | 'quiz' | 'checkin';
    url?: string;
    cooldown?: number;
    expires_at?: string;
    is_completed?: boolean;
    questions?: Array<{
        question: string;
        options: string[];
        answer: number;
    }>;
}

export default function EarnPage() {
    const { user, refreshUser, loading } = useUser();
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [activeQuiz, setActiveQuiz] = useState<Task | null>(null);
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

    const handleExecute = (task: Task) => {
        if (task.type === 'quiz' && task.questions && task.questions.length > 0) {
            setActiveQuiz(task);
        } else {
            setCompletingId(task.id);
            completeTaskMutation.mutate(task.id, {
                onSettled: () => setCompletingId(null)
            });
        }
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
                <div style={{ position: 'absolute', top: '0', right: '0', width: '200px', height: '100px', background: 'var(--emerald)', filter: 'blur(100px)', opacity: 0.1 }} />
            </div>

            {tasks.length > 0 ? tasks.map((task: Task) => (
                <MissionCard
                    key={task.id}
                    task={task}
                    onExecute={handleExecute}
                    isCompleting={completingId === task.id}
                    isPremium={user?.is_premium}
                />
            )) : (
                <div className="glass-panel flex-center" style={{ gridColumn: '1 / -1', padding: '80px 20px', flexDirection: 'column', gap: '24px', border: '1px solid #111', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ padding: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)' }}>
                        <Activity size={48} strokeWidth={1} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', letterSpacing: '2px', marginBottom: '8px' }}>NO ACTIVE MISSIONS</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>Global operational flow is currently optimized. Check back soon.</p>
                    </div>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
                        style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '12px 32px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}
                    >
                        SYNCHRONIZE MANUALLY
                    </button>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '48px', background: 'rgba(255,255,255,0.01)', border: '1px solid #222', textAlign: 'center', borderRadius: '4px' }}>
                <Info size={32} color="var(--text-dim)" strokeWidth={1} style={{ marginBottom: '24px' }} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '24px' }}>
                    MISSION PARAMETERS REFRESH AT 00:00 UTC.
                </p>
                <div style={{ color: '#fff', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '2px' }}>
                    REVIEW OPERATION GUIDELINES <ChevronRight size={14} />
                </div>
            </div>

            {activeQuiz && (
                <QuizModal
                    task={activeQuiz}
                    onClose={() => setActiveQuiz(null)}
                    onComplete={(id) => completeTaskMutation.mutate(id)}
                    isSubmitting={completeTaskMutation.isPending}
                />
            )}
        </div>
    );
}

function QuizModal({ task, onClose, onComplete, isSubmitting }: { task: Task, onClose: () => void, onComplete: (id: string) => void, isSubmitting: boolean }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [answers, setAnswers] = useState<number[]>([]);
    const [status, setStatus] = useState<'playing' | 'failed' | 'success'>('playing');

    const currentQuestion = task.questions![currentIdx];

    useEffect(() => {
        if (status !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus('failed');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIdx, status]);

    const handleAnswer = (idx: number) => {
        if (status !== 'playing') return;

        if (idx !== currentQuestion.answer) {
            setStatus('failed');
            return;
        }

        const newAnswers = [...answers, idx];
        setAnswers(newAnswers);

        if (currentIdx + 1 < task.questions!.length) {
            setCurrentIdx(currentIdx + 1);
            setTimeLeft(10);
        } else {
            setStatus('success');
            // Slight delay before completing to show success state
            setTimeout(() => onComplete(task.id), 1500);
        }
    };

    return (
        <div className="modal-overlay flex-center" style={{ zIndex: 2000 }}>
            <div className="glass-panel animate-scale-up" style={{
                width: '95%', maxWidth: '500px',
                background: '#000',
                border: '1px solid #333',
                padding: '40px',
                borderRadius: '32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                {status === 'playing' ? (
                    <>
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[...Array(task.questions!.length)].map((_, i) => (
                                    <div key={i} style={{
                                        width: '40px', height: '4px',
                                        background: i <= currentIdx ? 'var(--primary)' : '#222',
                                        borderRadius: '2px',
                                        transition: '0.3s'
                                    }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft <= 3 ? 'var(--error)' : 'var(--primary)', fontWeight: '950', fontSize: '1.2rem' }}>
                                <Timer size={20} /> {timeLeft}s
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '4px', marginBottom: '12px' }}>QUESTION {currentIdx + 1}</p>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', lineHeight: 1.3 }}>{currentQuestion.question}</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    style={{
                                        width: '100%',
                                        padding: '24px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid #222',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        textAlign: 'left',
                                        transition: '0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.border = '1px solid var(--primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.border = '1px solid #222'}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                ) : status === 'failed' ? (
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '24px', padding: '40px 0' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={40} color="var(--error)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', textAlign: 'center' }}>MISSION FAILED</h2>
                        <p style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem' }}>Time ran out or you selected the wrong answer. Synchronization failed.</p>
                        <button onClick={onClose} className="btn" style={{ background: '#fff', color: '#000', padding: '16px 40px', letterSpacing: '2px' }}>TRY AGAIN LATER</button>
                    </div>
                ) : (
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '24px', padding: '40px 0' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={40} color="var(--emerald)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', textAlign: 'center' }}>{isSubmitting ? "SYNCHRONIZING..." : "MISSION COMPLETE"}</h2>
                        <p style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem' }}>All protocols verified. Rewards are being dispatched.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MissionCard({ task, onExecute, isCompleting, isPremium }: { task: Task, onExecute: (t: Task) => void, isCompleting: boolean, isPremium?: boolean }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!task.expires_at) return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const exp = new Date(task.expires_at!).getTime();
            const diff = exp - now;

            if (diff <= 0) {
                setTimeLeft("EXPIRED");
                clearInterval(timer);
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h}H ${m}M ${s}S`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [task.expires_at]);

    return (
        <div className="glass-panel glass-vibrant" style={{
            padding: '40px',
            border: task.is_completed ? '1.5px solid #222' : '1.5px solid var(--emerald)',
            borderRadius: '24px',
            background: task.is_completed
                ? 'linear-gradient(135deg, #111 0%, #000 100%)'
                : 'linear-gradient(135deg, #065f46 0%, #020617 100%)',
            display: 'flex', flexDirection: 'column', gap: '32px',
            transition: 'all 0.5s var(--transition)',
            position: 'relative',
            overflow: 'hidden',
            opacity: task.is_completed ? 0.6 : 1,
            pointerEvents: task.is_completed ? 'none' : 'auto',
            boxShadow: task.is_completed ? 'none' : '0 20px 40px rgba(16, 185, 129, 0.2)'
        }}>
            {/* Status Overlays */}
            {task.is_completed && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(2px)' }}>
                    <div style={{
                        background: '#000',
                        border: '1px solid #333',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        color: 'var(--text-dim)',
                        fontSize: '0.7rem',
                        fontWeight: '950',
                        letterSpacing: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <CheckCircle2 size={16} color="var(--emerald)" /> MISSION CLAIMED
                    </div>
                </div>
            )}

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
                    {task.type === "quiz" && <Zap size={32} strokeWidth={2} color="var(--primary)" />}
                </div>
                <div style={{ flex: 1 }}>
                    <div className="flex" style={{ flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', letterSpacing: '1px' }}>{task.title.toUpperCase()}</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {task.questions && (
                                <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '950', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Timer size={10} /> {task.questions.length} QUESTIONS
                                </div>
                            )}
                            {timeLeft && (
                                <div style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: '950', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={10} /> {timeLeft}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginTop: '12px' }}>
                        <span style={{ color: 'var(--emerald)', fontSize: '1.75rem', fontWeight: '950', letterSpacing: '-2px' }}>{task.reward.toLocaleString()}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '950', letterSpacing: '2px' }}>FLOW CAPITAL</span>
                            {isPremium && (
                                <span style={{ color: 'var(--gold)', fontSize: '0.55rem', fontWeight: '950', letterSpacing: '1px' }}>+20% PREMIUM BOOST ACTIVE</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onExecute(task)}
                disabled={isCompleting || task.is_completed}
                className="btn"
                style={{
                    width: '100%',
                    height: '72px',
                    fontSize: '0.9rem',
                    borderRadius: '16px',
                    background: task.is_completed ? 'transparent' : '#fff',
                    color: task.is_completed ? '#333' : '#000',
                    border: task.is_completed ? '1px solid #222' : 'none',
                    fontWeight: '950',
                    letterSpacing: '4px',
                    boxShadow: task.is_completed ? 'none' : '0 15px 30px rgba(255,255,255,0.2)'
                }}
            >
                {isCompleting ? "EXECUTING..." : task.is_completed ? "MISSION ARCHIVED" : "EXECUTE MISSION"}
            </button>
        </div>
    );
}
