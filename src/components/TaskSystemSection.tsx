import React from 'react';
import { CheckSquare, Sparkles, CheckCircle2, Clock, ShieldCheck, Play } from 'lucide-react';
import { PanelTaskItem } from '../types';

interface TaskSystemSectionProps {
  tasks: PanelTaskItem[];
  tasksCompletedToday: number;
  maxDailyTasks?: number;
  bankedHours: number;
  maxBankedHours?: number;
  onExecuteTask: (taskId: string) => void;
  isProcessingTask?: string | null;
  demoMode: boolean;
}

export const TaskSystemSection: React.FC<TaskSystemSectionProps> = ({
  tasks,
  tasksCompletedToday,
  maxDailyTasks = 5,
  bankedHours,
  maxBankedHours = 24.0,
  onExecuteTask,
  isProcessingTask = null,
  demoMode,
}) => {
  const isAllTasksCompleted = tasksCompletedToday >= maxDailyTasks;
  const isBankFull = bankedHours >= maxBankedHours;

  return (
    <div 
      id="task-system-section"
      className="bg-[#101622] rounded-xl border border-[#232f45] shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141c2c] to-[#101622]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-gaming text-white tracking-wide">
              Daily Tasks
            </h2>
            <p className="text-xs text-slate-400">
              Legitimate backend keep-alive & daemon verification jobs
            </p>
          </div>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-code px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Tasks: {tasksCompletedToday}/{maxDailyTasks}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0a0e16] rounded-xl border border-[#1e2a3c]">
          {/* Card 1: Tasks Today */}
          <div>
            <span className="text-[11px] font-gaming text-slate-400 uppercase tracking-wider block">
              Tasks Today
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-code text-white">
                {tasksCompletedToday}/{maxDailyTasks}
              </span>
              <span className="text-xs text-emerald-400 font-gaming">
                {isAllTasksCompleted ? 'Daily Cap Reached' : 'In Progress'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (tasksCompletedToday / maxDailyTasks) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Ready for a new task */}
          <div>
            <span className="text-[11px] font-gaming text-slate-400 uppercase tracking-wider block">
              Ready for a new task
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-base font-gaming font-bold text-amber-300">
                Reward: +2.0h
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Adds operational banking quota
            </span>
          </div>

          {/* Card 3: Maximum */}
          <div>
            <span className="text-[11px] font-gaming text-slate-400 uppercase tracking-wider block">
              Maximum Bank
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-gaming text-amber-400">
                24.0h
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                ({bankedHours.toFixed(1)}h current)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Cap prevents excessive idle reservation
            </span>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          <p className="text-xs font-gaming font-semibold text-slate-300 uppercase tracking-wider">
            Available Routine Tasks
          </p>

          <div className="space-y-2">
            {tasks.map((task, index) => {
              const isProcessing = isProcessingTask === task.id;
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#090d14] border-[#182333] opacity-75'
                      : 'bg-[#0c121d] border-[#1f2b3e] hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded mt-0.5 ${
                      task.completed 
                        ? 'bg-emerald-950/60 text-emerald-400' 
                        : 'bg-amber-950/60 text-amber-400'
                    }`}>
                      {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-gaming font-bold text-white">
                          #{index + 1} {task.title}
                        </span>
                        <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          +{task.rewardHours.toFixed(1)}h
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {task.completed ? (
                      <span className="text-xs font-gaming font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onExecuteTask(task.id)}
                        disabled={isProcessing || isBankFull}
                        className={`py-1.5 px-3.5 rounded-lg text-xs font-gaming font-bold transition active:scale-95 flex items-center gap-1.5 ${
                          isBankFull
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>RUN TASK</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-[#1b2537] text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>When a legitimate backend task completes, the counter updates with audited verification.</span>
        </div>
      </div>
    </div>
  );
};
