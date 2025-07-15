import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Zap, Edit3, Clock, FileText, Trash2 } from 'lucide-react';

const GoalBreakdownApp = () => {
  const [mainGoal, setMainGoal] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Generate unique ID for tasks
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Clean and parse AI response
  const cleanAndParseResponse = (response) => {
    let cleaned = response.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw error;
    }
  };

  // AI-powered task breakdown
  const breakdownTask = async (taskName, parentPath = []) => {
    setIsBreakingDown(true);
    try {
      const contextInfo = parentPath.length > 0 ? ` (This is a subtask of: ${parentPath.join(' > ')})` : '';
      
      const prompt = `
Break down this goal into 3-6 logical subtasks: "${taskName}"${contextInfo}

YOUR ENTIRE RESPONSE MUST BE A SINGLE, VALID JSON OBJECT. DO NOT USE MARKDOWN CODE BLOCKS OR BACKTICKS.

Respond in this exact format:
{
  "subtasks": [
    {
      "name": "Subtask name",
      "description": "Brief description",
      "minHours": 5,
      "maxHours": 15,
      "confidence": "medium",
      "complexity": "simple"
    }
  ]
}

For time estimates:
- Use realistic ranges (minHours to maxHours) 
- Keep ranges tight (max should be 2-4x min, not 10x)
- Consider realistic work pace and learning curves

Confidence levels:
- "high": Very predictable task, estimate likely accurate
- "medium": Some uncertainty, could vary
- "low": High uncertainty, many unknowns

Complexity must be "simple", "medium", or "complex". DO NOT OUTPUT ANYTHING OTHER THAN THE JSON OBJECT.
`;

      const response = await window.claude.complete(prompt);
      const parsed = cleanAndParseResponse(response);
      
      return parsed.subtasks.map(subtask => ({
        id: generateId(),
        name: subtask.name,
        description: subtask.description,
        minHours: subtask.minHours,
        maxHours: subtask.maxHours,
        confidence: subtask.confidence,
        complexity: subtask.complexity,
        subtasks: [],
        expanded: false,
        completed: false
      }));
    } catch (error) {
      console.error('Error breaking down task:', error);
      return [];
    } finally {
      setIsBreakingDown(false);
    }
  };

  // Initialize main goal breakdown
  const handleMainGoalBreakdown = async () => {
    if (!mainGoal.trim()) return;
    
    const subtasks = await breakdownTask(mainGoal);
    const mainTask = {
      id: generateId(),
      name: mainGoal,
      description: `Main project idea`,
      minHours: 0,
      maxHours: 0,
      confidence: 'medium',
      complexity: 'complex',
      subtasks: subtasks,
      expanded: true,
      completed: false,
      isMainGoal: true
    };
    
    setTasks([mainTask]);
  };

  // Add subtasks to existing task
  const addSubtasks = async (taskId, taskName, parentPath) => {
    const subtasks = await breakdownTask(taskName, parentPath);
    
    const updateTask = (taskList) => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [...task.subtasks, ...subtasks],
            expanded: true
          };
        }
        return {
          ...task,
          subtasks: updateTask(task.subtasks)
        };
      });
    };
    
    setTasks(updateTask(tasks));
  };

  // Toggle task expansion
  const toggleExpanded = (taskId) => {
    const updateTask = (taskList) => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, expanded: !task.expanded };
        }
        return {
          ...task,
          subtasks: updateTask(task.subtasks)
        };
      });
    };
    
    setTasks(updateTask(tasks));
  };

  // Toggle task completion
  const toggleCompleted = (taskId) => {
    const updateTask = (taskList) => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return {
          ...task,
          subtasks: updateTask(task.subtasks)
        };
      });
    };
    
    setTasks(updateTask(tasks));
  };

  // Add manual subtask
  const addManualSubtask = (parentId) => {
    const newSubtask = {
      id: generateId(),
      name: 'New subtask',
      description: 'Click to edit description',
      minHours: 1,
      maxHours: 3,
      confidence: 'medium',
      complexity: 'simple',
      subtasks: [],
      expanded: false,
      completed: false
    };

    const updateTask = (taskList) => {
      return taskList.map(task => {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: [...task.subtasks, newSubtask],
            expanded: true
          };
        }
        return {
          ...task,
          subtasks: updateTask(task.subtasks)
        };
      });
    };
    
    setTasks(updateTask(tasks));
    setEditingTask(newSubtask.id);
  };

  // Update task details
  const updateTask = (taskId, updates) => {
    const updateTaskInList = (taskList) => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        return {
          ...task,
          subtasks: updateTaskInList(task.subtasks)
        };
      });
    };
    
    setTasks(updateTaskInList(tasks));
    setEditingTask(null);
  };

  // Delete task
  const deleteTask = (taskId) => {
    const deleteFromList = (taskList) => {
      return taskList.filter(task => task.id !== taskId).map(task => ({
        ...task,
        subtasks: deleteFromList(task.subtasks)
      }));
    };
    
    setTasks(deleteFromList(tasks));
  };

  // Calculate total time for a task and its subtasks
  const calculateTotalTime = (task) => {
    const subtaskTotals = task.subtasks.reduce((totals, subtask) => {
      const subtaskTotal = calculateTotalTime(subtask);
      return {
        min: totals.min + subtaskTotal.min,
        max: totals.max + subtaskTotal.max
      };
    }, { min: 0, max: 0 });
    
    return {
      min: (task.minHours || 0) + subtaskTotals.min,
      max: (task.maxHours || 0) + subtaskTotals.max
    };
  };

  // Get task path for context
  const getTaskPath = (taskId, taskList = tasks, currentPath = []) => {
    for (const task of taskList) {
      const newPath = [...currentPath, task.name];
      if (task.id === taskId) {
        return newPath;
      }
      const found = getTaskPath(taskId, task.subtasks, newPath);
      if (found) return found;
    }
    return null;
  };

  // Task component
  const TaskItem = ({ task, depth = 0 }) => {
    const hasSubtasks = task.subtasks.length > 0;
    const totalTime = calculateTotalTime(task);
    const isEditing = editingTask === task.id;
    const taskPath = getTaskPath(task.id)?.slice(0, -1) || [];

    const complexityColors = {
      simple: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      complex: 'bg-red-100 text-red-700'
    };

    const confidenceColors = {
      high: 'bg-emerald-100 text-emerald-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-orange-100 text-orange-700'
    };

    const confidenceIcons = {
      high: '🎯',
      medium: '📊',
      low: '❓'
    };

    return (
      <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className={`p-4 bg-white rounded-lg border shadow-sm mb-2 ${task.completed ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {hasSubtasks && (
                <button
                  onClick={() => toggleExpanded(task.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleCompleted(task.id)}
                className="rounded text-blue-600"
              />
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      className="w-full p-2 border rounded"
                      onBlur={() => setEditingTask(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTask(null)}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Description"
                    />
                    <div className="flex space-x-2">
                      <div className="flex space-x-1 items-center">
                        <input
                          type="number"
                          value={task.minHours || 0}
                          onChange={(e) => updateTask(task.id, { minHours: parseInt(e.target.value) || 0 })}
                          className="w-16 p-2 border rounded text-sm"
                          min="0"
                          placeholder="Min"
                        />
                        <span className="text-sm text-gray-500">-</span>
                        <input
                          type="number"
                          value={task.maxHours || 0}
                          onChange={(e) => updateTask(task.id, { maxHours: parseInt(e.target.value) || 0 })}
                          className="w-16 p-2 border rounded text-sm"
                          min="0"
                          placeholder="Max"
                        />
                        <span className="text-sm text-gray-500">h</span>
                      </div>
                      <select
                        value={task.confidence || 'medium'}
                        onChange={(e) => updateTask(task.id, { confidence: e.target.value })}
                        className="p-2 border rounded text-sm"
                      >
                        <option value="high">High confidence</option>
                        <option value="medium">Medium confidence</option>
                        <option value="low">Low confidence</option>
                      </select>
                      <select
                        value={task.complexity}
                        onChange={(e) => updateTask(task.id, { complexity: e.target.value })}
                        className="p-2 border rounded text-sm"
                      >
                        <option value="simple">Simple</option>
                        <option value="medium">Medium</option>
                        <option value="complex">Complex</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through' : ''} ${task.isMainGoal ? 'text-lg text-blue-700' : ''}`}>
                      {task.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    <div className="flex items-center space-x-3 mt-2 flex-wrap gap-y-1">
                      <span className={`px-2 py-1 rounded text-xs ${complexityColors[task.complexity]}`}>
                        {task.complexity}
                      </span>
                      {task.confidence && (
                        <span className={`px-2 py-1 rounded text-xs flex items-center ${confidenceColors[task.confidence]}`}>
                          <span className="mr-1">{confidenceIcons[task.confidence]}</span>
                          {task.confidence}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs flex items-center">
                        <Clock size={12} className="mr-1" />
                        {totalTime.min === totalTime.max ? 
                          `${totalTime.min}h total` : 
                          `${totalTime.min}-${totalTime.max}h total`
                        }
                      </span>
                      {(task.minHours > 0 || task.maxHours > 0) && (
                        <span className="text-gray-400 text-xs">
                          ({task.minHours === task.maxHours ? 
                            `${task.minHours}h` : 
                            `${task.minHours}-${task.maxHours}h`} direct)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingTask(task.id)}
                className="text-gray-400 hover:text-gray-600"
                title="Edit task"
              >
                <Edit3 size={16} />
              </button>
              
              <button
                onClick={() => addSubtasks(task.id, task.name, taskPath)}
                disabled={isBreakingDown}
                className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                title="AI breakdown"
              >
                <Zap size={16} />
              </button>
              
              <button
                onClick={() => addManualSubtask(task.id)}
                className="text-green-500 hover:text-green-700"
                title="Add manual subtask"
              >
                <Plus size={16} />
              </button>
              
              {!task.isMainGoal && (
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {task.expanded && hasSubtasks && (
          <div className="space-y-1">
            {task.subtasks.map(subtask => (
              <TaskItem key={subtask.id} task={subtask} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalProjectTime = tasks.length > 0 ? calculateTotalTime(tasks[0]) : { min: 0, max: 0 };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FileText className="mr-3 text-blue-600" size={32} />
            napkin
          </h1>
          <p className="text-gray-600">sketch out the steps and estimate the effort to make an idea real</p>
        </div>
        
        {tasks.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your idea?
              </label>
              <input
                type="text"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                placeholder="e.g., Launch a food truck, Build a mobile app, Write and publish a book..."
                className="w-full p-4 border border-gray-300 rounded-lg text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleMainGoalBreakdown()}
              />
            </div>
            
            <button
              onClick={handleMainGoalBreakdown}
              disabled={!mainGoal.trim() || isBreakingDown}
              className="w-full bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isBreakingDown ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sketching out your idea...
                </>
              ) : (
                <>
                  <Zap className="mr-2" size={20} />
                  Sketch It Out
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-800">Idea Overview</h2>
                <button
                  onClick={() => {
                    setTasks([]);
                    setMainGoal('');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Start New Idea
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-blue-700">
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {totalProjectTime.min === totalProjectTime.max ? 
                    `Estimated time: ${totalProjectTime.min} hours` :
                    `Estimated time: ${totalProjectTime.min}-${totalProjectTime.max} hours`
                  }
                </span>
                <span>
                  ≈ {totalProjectTime.min === totalProjectTime.max ? 
                    `${Math.ceil(totalProjectTime.min / 8)}` :
                    `${Math.ceil(totalProjectTime.min / 8)}-${Math.ceil(totalProjectTime.max / 8)}`
                  } working days
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
            
            {isBreakingDown && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">AI is analyzing and breaking down your task...</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center space-x-4 flex-wrap">
            <span className="flex items-center"><Zap size={16} className="mr-1" /> AI breakdown</span>
            <span className="flex items-center"><Plus size={16} className="mr-1" /> Manual subtask</span>
            <span className="flex items-center"><Edit3 size={16} className="mr-1" /> Edit details</span>
            <span className="flex items-center">🎯 High confidence</span>
            <span className="flex items-center">📊 Medium confidence</span>
            <span className="flex items-center">❓ Low confidence</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalBreakdownApp;