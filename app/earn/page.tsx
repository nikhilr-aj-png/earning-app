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
    is_locked?: boolean;
    earned_amount?: number;
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
        mutationFn: async ({ taskId, correctCount, totalCount }: { taskId: string, correctCount?: number, totalCount?: number }) => {
            const res = await fetch("/api/tasks/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || "",
                },
                body: JSON.stringify({ taskId, correctCount, totalCount }),
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
        if (task.is_locked) {
            showToast("PREMIUM STATUS REQUIRED FOR THIS MISSION", "error");
            return;
        }
        if (task.is_completed) {
            showToast("MISSION ALREADY COMPLETED", "info");
            return;
        }

        if (task.type === 'quiz' && task.questions && task.questions.length > 0) {
            setActiveQuiz(task);
        } else {
            setCompletingId(task.id);
            completeTaskMutation.mutate({ taskId: task.id }, {
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
                <h1 className="font-heading" style={{ fontSize: '3.2rem', fontWeight: '950', letterSpacing: '-4px', marginBottom: '8px', lineHeight: 1.1 }}>Flow Tasks</h1>
                <div style={{ position: 'absolute', top: '0', right: '0', width: '200px', height: '100px', background: 'var(--emerald)', filter: 'blur(100px)', opacity: 0.1 }} />
            </div>

            {/* Active Missions */}
            <div style={{ marginBottom: '64px' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }} />
                    <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '2px' }}>ACTIVE TASKS</span>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {tasks.filter(t => !t.is_completed).length > 0 ? (
                        tasks.filter(t => !t.is_completed).map((task: Task) => (
                            <MissionCard
                                key={task.id}
                                task={task}
                                onExecute={handleExecute}
                                isCompleting={completingId === task.id}
                                isPremium={user?.is_premium}
                            />
                        ))
                    ) : (
                        <div className="glass-panel flex-center" style={{ gridColumn: '1 / -1', padding: '60px 20px', flexDirection: 'column', gap: '20px', border: '1px solid #111' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>NO ACTIVE TASKS AVAILABLE.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Completed Missions (The "Box" at the bottom) */}
            {tasks.filter(t => t.is_completed).length > 0 && (
                <div style={{ width: '75%', margin: '80px auto 0', padding: '32px', background: 'rgba(255,255,255,0.01)', border: '1px solid #111', borderRadius: '24px' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginBottom: '32px' }}>
                        <CheckCircle2 size={16} color="var(--text-dim)" />
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '2px' }}>COMPLETED TASK LOGS</span>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px'
                    }}>
                        {tasks.filter(t => t.is_completed).map((task: Task) => (
                            <div key={task.id} className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid #222', borderRadius: '12px', opacity: 0.6 }}>
                                <div className="flex-between">
                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>{task.title.toUpperCase()}</h4>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--emerald)', fontWeight: '950' }}>{task.earned_amount?.toLocaleString() || 0} FLOW CLAIMED</p>
                                    </div>
                                    <CheckCircle2 size={20} color="var(--emerald)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {activeQuiz && (
                <QuizModal
                    task={activeQuiz}
                    onClose={() => setActiveQuiz(null)}
                    onComplete={(id, correct, total) => completeTaskMutation.mutate({ taskId: id, correctCount: correct, totalCount: total })}
                    isSubmitting={completeTaskMutation.isPending}
                />
            )}
        </div>
    );
}

function QuizModal({ task, onClose, onComplete, isSubmitting }: { task: Task, onClose: () => void, onComplete: (id: string, correct: number, total: number) => void, isSubmitting: boolean }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [answers, setAnswers] = useState<number[]>([]);
    const [status, setStatus] = useState<'playing' | 'calculating' | 'success'>('playing');
    const [correctCount, setCorrectCount] = useState(0);

    const currentQuestion = task.questions![currentIdx];

    useEffect(() => {
        if (status !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time out
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIdx, status]);

    const handleAnswer = (idx: number) => {
        if (status !== 'playing') return;

        const isCorrect = idx === currentQuestion.answer;
        if (isCorrect) setCorrectCount(prev => prev + 1);

        const newAnswers = [...answers, idx];
        setAnswers(newAnswers);

        if (currentIdx + 1 < task.questions!.length) {
            setCurrentIdx(currentIdx + 1);
            setTimeLeft(15);
        } else {
            setStatus('calculating');
            const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
            setTimeout(() => {
                setStatus('success');
                onComplete(task.id, finalCorrect, task.questions!.length);
            }, 3000); // 3s for professional calculation feel
        }
    };

    return (
        <div className="modal-overlay flex-center" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="animate-scale-up" style={{
                width: '75%', maxWidth: '600px',
                maxHeight: '80vh', overflowY: 'auto',
                background: '#020617',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '32px',
                borderRadius: '40px',
                position: 'relative',
                boxShadow: '0 0 100px rgba(16, 185, 129, 0.05)'
            }}>
                {/* Tactical Corner Glitches */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '2px solid var(--emerald)', borderLeft: '2px solid var(--emerald)', opacity: 0.5 }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '2px solid var(--emerald)', borderRight: '2px solid var(--emerald)', opacity: 0.5 }} />

                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '32px', right: '32px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', zIndex: 10 }}>
                    <X size={24} />
                </button>

                {status === 'playing' ? (
                    <>
                        <div className="flex-between" style={{ marginBottom: '40px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                {[...Array(task.questions!.length)].map((_, i) => (
                                    <div key={i} style={{
                                        flex: 1, height: '6px',
                                        background: i < currentIdx ? 'var(--emerald)' : i === currentIdx ? 'rgba(16, 185, 129, 0.2)' : '#111',
                                        borderRadius: '3px',
                                        transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: i === currentIdx ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none'
                                    }} />
                                ))}
                            </div>
                            <div style={{
                                marginLeft: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: timeLeft <= 5 ? 'var(--error)' : 'var(--emerald)',
                                fontWeight: '950',
                                fontSize: '1.4rem',
                                letterSpacing: '-1px'
                            }}>
                                <Timer size={24} /> {timeLeft}s
                            </div>
                        </div>

                        <div style={{ marginBottom: '48px' }}>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                                <Activity size={14} color="var(--primary)" />
                                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '950', letterSpacing: '4px' }}>QUESTION {currentIdx + 1} OF {task.questions!.length}</span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '950', color: '#fff', lineHeight: 1.2, letterSpacing: '-0.5px' }}>{currentQuestion.question}</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    style={{
                                        width: '100%',
                                        padding: '28px 32px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid #1e293b',
                                        borderRadius: '24px',
                                        color: '#cbd5e1',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        textAlign: 'left',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                                        e.currentTarget.style.border = '1px solid var(--emerald)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.border = '1px solid #1e293b';
                                        e.currentTarget.style.color = '#cbd5e1';
                                    }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '950' }} className="flex-center">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                ) : status === 'calculating' ? (
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '32px', padding: '60px 0' }}>
                        <div style={{ position: 'relative' }}>
                            <div className="spinner" style={{ width: '100px', height: '100px', border: '2px solid rgba(16, 185, 129, 0.1)', borderTop: '2px solid var(--emerald)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <Activity size={40} color="var(--emerald)" className="animate-pulse" />
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff', marginBottom: '12px', letterSpacing: '-1px' }}>ANALYZING PERFORMANCE</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: '900' }}>COMPILING METRICS... {Math.round(Math.random() * 100)}%</p>
                        </div>
                        <div style={{ width: '100%', background: '#111', height: '4px', borderRadius: '2px', maxWidth: '300px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--emerald)', width: '60%', animation: 'loading-progress 3s ease-in-out' }} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-center animate-fade-in" style={{ flexDirection: 'column', gap: '40px', padding: '40px 0' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle2 size={60} color="var(--emerald)" strokeWidth={1} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: '950', color: '#fff', letterSpacing: '-2px', marginBottom: '8px' }}>MISSION SUCCESS</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: '950', letterSpacing: '4px' }}>EFFICIENCY RATING: {Math.round((correctCount / task.questions!.length) * 100)}%</p>
                        </div>

                        <div className="glass-panel" style={{ width: '100%', padding: '32px', background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '24px' }}>
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '2px' }}>DATA ACQUISITION</span>
                                <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '950' }}>{correctCount} / {task.questions!.length} BLOCKS</span>
                            </div>
                            <div className="flex-between">
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '2px' }}>ESTIMATED FLOW</span>
                                <span style={{ fontSize: '1.2rem', color: 'var(--emerald)', fontWeight: '950' }}>+{task.reward.toLocaleString()}</span>
                            </div>
                        </div>

                        <button onClick={onClose} className="btn" style={{
                            background: '#fff',
                            color: '#000',
                            height: '72px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '950',
                            letterSpacing: '4px',
                            width: '100%',
                            boxShadow: '0 20px 40px rgba(255,255,255,0.1)'
                        }}>TERMINATE SESSION</button>
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
                setTimeLeft("TERM");
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

    const isExpired = timeLeft === "TERM";

    return (
        <div className="glass-panel" style={{
            padding: 'var(--card-padding, 32px)',
            border: task.is_completed ? '1px solid #111' : '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '40px',
            background: task.is_completed
                ? 'rgba(255,255,255,0.01)'
                : 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(2, 6, 23, 0.95) 100%)',
            display: 'flex', flexDirection: 'column', gap: '32px',
            transition: 'all 0.4s var(--transition)',
            position: 'relative',
            overflow: 'hidden',
            opacity: task.is_completed || isExpired ? 0.6 : 1,
            boxShadow: task.is_completed ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(16, 185, 129, 0.05)',
            minHeight: '440px'
        }}>
            {/* Animated Liquid Background Overlay */}
            {!task.is_completed && !isExpired && (
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
                    animation: 'spin 20s linear infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
            )}

            {/* Status Indicator Bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: task.is_completed ? '#222' : isExpired ? 'var(--error)' : 'linear-gradient(90deg, var(--emerald), var(--primary))',
                opacity: 0.8
            }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '28px', height: '100%' }}>
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                    <div style={{
                        width: '72px', height: '72px',
                        borderRadius: '24px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: task.type === 'quiz' ? 'var(--primary)' : '#fff',
                        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.01)'
                    }} className="flex-center">
                        {task.type === "ad" && <PlayCircle size={32} strokeWidth={1} />}
                        {task.type === "visit" && <ExternalLink size={32} strokeWidth={1} />}
                        {task.type === "checkin" && <CheckCircle2 size={32} strokeWidth={1} />}
                        {task.type === "quiz" && <Zap size={32} strokeWidth={1} fill="var(--primary)" fillOpacity={0.1} />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {timeLeft && (
                            <div style={{
                                fontSize: '0.6rem',
                                color: isExpired ? 'var(--error)' : 'var(--gold)',
                                fontWeight: '950',
                                letterSpacing: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`
                            }}>
                                <Clock size={12} /> {timeLeft}
                            </div>
                        )}
                        {task.questions && (
                            <div style={{
                                fontSize: '0.6rem',
                                color: 'var(--primary)',
                                fontWeight: '950',
                                letterSpacing: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                                <Activity size={12} /> {task.questions.length} DATA BLOCKS
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '4px', height: '12px', background: 'var(--emerald)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '3px' }}>
                            {task.is_completed ? 'TASK COMPLETED' : isExpired ? 'TIME OVERFLOW' : 'ACTIVE MISSION'}
                        </span>
                    </div>

                    <h3 style={{
                        fontSize: '1.4rem',
                        fontWeight: '950',
                        color: '#fff',
                        letterSpacing: '-1px',
                        marginBottom: '16px',
                        lineHeight: 1.1,
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                        {task.title.toUpperCase()}
                    </h3>

                    <div className="flex" style={{ alignItems: 'baseline', gap: '8px' }}>
                        <span style={{
                            color: 'var(--emerald)',
                            fontSize: '2.8rem',
                            fontWeight: '950',
                            letterSpacing: '-3px',
                            lineHeight: 1,
                            textShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
                        }}>{task.reward.toLocaleString()}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem', fontWeight: '950', letterSpacing: '2px' }}>FLOW ACQUISITION</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onExecute(task)}
                    disabled={isCompleting || task.is_completed || isExpired}
                    className="btn"
                    style={{
                        width: '100%',
                        height: '72px',
                        fontSize: '0.8rem',
                        borderRadius: '20px',
                        background: (task.is_locked || isExpired || task.is_completed) ? 'rgba(255,255,255,0.02)' : '#fff',
                        color: (task.is_locked || isExpired || task.is_completed) ? 'rgba(255,255,255,0.1)' : '#000',
                        fontWeight: '950',
                        letterSpacing: '4px',
                        marginTop: 'auto',
                        border: (task.is_locked || isExpired || task.is_completed) ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        cursor: (task.is_locked || isExpired || task.is_completed) ? 'not-allowed' : 'pointer',
                        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: (task.is_locked || isExpired || task.is_completed) ? 'none' : '0 15px 35px rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={(e) => {
                        if (!isCompleting && !task.is_completed && !isExpired && !task.is_locked) {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 20px 45px rgba(255,255,255,0.15)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = (task.is_locked || isExpired || task.is_completed) ? 'none' : '0 15px 35px rgba(255,255,255,0.1)';
                    }}
                >
                    {isCompleting ? "INITIALIZING..." : task.is_locked ? "LOCKED (PREMIUM)" : task.is_completed ? "COMPLETED" : isExpired ? "TIME EXPIRY" : "START TASK"}
                </button>
            </div>
        </div>
    );
}
