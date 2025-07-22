import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useSpecificationPhase, useSpecificationValidation } from '@/contexts/SpecificationContext';
import type { SpecificationPhase, ValidationResult } from '@/types/specifications';

// Phase configuration
const phaseConfig: Record<SpecificationPhase, {
  label: string;
  description: string;
  color: 'gray' | 'blue' | 'green' | 'yellow' | 'red';
  icon: string;
  requiredFields: string[];
}> = {
  requirements: {
    label: 'Requirements',
    description: 'Define project scope and user needs',
    color: 'blue',
    icon: '📋',
    requiredFields: ['user stories', 'acceptance criteria'],
  },
  design: {
    label: 'Design',
    description: 'Create technical architecture and UI/UX designs',
    color: 'green',
    icon: '🎨',
    requiredFields: ['architecture', 'components', 'data models'],
  },
  tasks: {
    label: 'Tasks',
    description: 'Break down implementation into actionable items',
    color: 'yellow',
    icon: '✅',
    requiredFields: ['task breakdown', 'dependencies', 'estimations'],
  },
  implementation: {
    label: 'Implementation',
    description: 'Execute development work',
    color: 'red',
    icon: '⚡',
    requiredFields: ['code implementation', 'testing'],
  },
  review: {
    label: 'Review',
    description: 'Quality assurance and testing',
    color: 'gray',
    icon: '🔍',
    requiredFields: ['code review', 'testing results'],
  },
  completed: {
    label: 'Completed',
    description: 'Final delivery and documentation',
    color: 'green',
    icon: '🎉',
    requiredFields: ['documentation', 'deployment'],
  },
};

// Phase order for navigation
const phaseOrder: SpecificationPhase[] = [
  'requirements',
  'design',
  'tasks',
  'implementation',
  'review',
  'completed',
];

interface PhaseManagerProps {
  className?: string;
  showValidation?: boolean;
  allowPhaseSkipping?: boolean;
}

export const PhaseManager: React.FC<PhaseManagerProps> = ({
  className = '',
  showValidation = true,
  allowPhaseSkipping = false,
}) => {
  const {
    currentPhase,
    phaseValidation,
    setCurrentPhase,
    canTransitionToPhase,
    transitionToPhase,
    validatePhase,
    isValidating,
  } = useSpecificationPhase();

  const { clearValidationResults } = useSpecificationValidation();

  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [targetPhase, setTargetPhase] = useState<SpecificationPhase | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  // Get current phase index
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);

  // Handle phase transition
  const handlePhaseTransition = async (phase: SpecificationPhase) => {
    if (phase === currentPhase) return;

    // Check if transition is allowed
    if (!allowPhaseSkipping && !canTransitionToPhase(phase)) {
      setTargetPhase(phase);
      setShowTransitionModal(true);
      return;
    }

    try {
      await transitionToPhase(phase);
    } catch (error) {
      console.error('Phase transition failed:', error);
    }
  };

  // Validate current phase
  const handleValidatePhase = async () => {
    try {
      const validation = await validatePhase(currentPhase);
      setValidationResults(validation.validationResults);
    } catch (error) {
      console.error('Phase validation failed:', error);
    }
  };

  // Get phase status
  const getPhaseStatus = (phase: SpecificationPhase): 'completed' | 'current' | 'available' | 'locked' => {
    const phaseIndex = phaseOrder.indexOf(phase);
    
    if (phase === currentPhase) return 'current';
    if (phaseIndex < currentPhaseIndex) return 'completed';
    if (canTransitionToPhase(phase) || allowPhaseSkipping) return 'available';
    return 'locked';
  };

  // Get phase completion percentage
  const getPhaseCompletion = (phase: SpecificationPhase): number => {
    const validation = phaseValidation[phase];
    return validation?.completionPercentage || 0;
  };

  // Clear validation results when phase changes
  useEffect(() => {
    setValidationResults([]);
  }, [currentPhase]);

  return (
    <div className={`phase-manager ${className}`}>
      {/* Phase Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {phaseOrder.map((phase, index) => {
          const config = phaseConfig[phase];
          const status = getPhaseStatus(phase);
          const completion = getPhaseCompletion(phase);
          
          return (
            <div key={phase} className="flex items-center">
              {/* Phase Button */}
              <button
                onClick={() => handlePhaseTransition(phase)}
                disabled={status === 'locked'}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                  ${status === 'current' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : status === 'completed'
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : status === 'available'
                    ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-lg">{config.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-sm">{config.label}</div>
                  {status === 'current' && completion > 0 && (
                    <div className="text-xs text-gray-500">{completion}% complete</div>
                  )}
                </div>
                {status === 'completed' && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Arrow */}
              {index < phaseOrder.length - 1 && (
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Phase Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{phaseConfig[currentPhase].icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{phaseConfig[currentPhase].label}</h3>
              <p className="text-sm text-gray-600">{phaseConfig[currentPhase].description}</p>
            </div>
          </div>
          
          {showValidation && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidatePhase}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Validating...
                  </>
                ) : (
                  'Validate Phase'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Phase Requirements */}
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Required Elements:</h4>
          <div className="flex flex-wrap gap-2">
            {phaseConfig[currentPhase].requiredFields.map((field) => (
              <Badge key={field} color="gray" size="sm">
                {field}
              </Badge>
            ))}
          </div>
        </div>

        {/* Validation Results */}
        {validationResults.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Validation Results:</h4>
            <div className="space-y-2">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`
                    flex items-start space-x-2 p-2 rounded text-sm
                    ${result.severity === 'error' 
                      ? 'bg-red-50 text-red-700' 
                      : result.severity === 'warning'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-blue-50 text-blue-700'
                    }
                  `}
                >
                  <span className="font-medium">
                    {result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <p>{result.message}</p>
                    {result.suggestion && (
                      <p className="mt-1 text-xs opacity-75">Suggestion: {result.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase Transition Modal */}
      <Modal
        isOpen={showTransitionModal}
        onClose={() => setShowTransitionModal(false)}
        title="Phase Transition Not Allowed"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You cannot transition to <strong>{targetPhase && phaseConfig[targetPhase].label}</strong> 
            because previous phases are not complete.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Required Steps:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {phaseOrder.slice(0, phaseOrder.indexOf(targetPhase || currentPhase)).map((phase) => {
                const validation = phaseValidation[phase];
                const isComplete = validation?.isComplete || false;
                
                return (
                  <li key={phase} className="flex items-center space-x-2">
                    <span className={isComplete ? 'text-green-600' : 'text-red-600'}>
                      {isComplete ? '✅' : '❌'}
                    </span>
                    <span>Complete {phaseConfig[phase].label} phase</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowTransitionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowTransitionModal(false);
                // Navigate to the first incomplete phase
                const firstIncomplete = phaseOrder.find((phase) => {
                  const validation = phaseValidation[phase];
                  return !validation?.isComplete;
                });
                if (firstIncomplete) {
                  setCurrentPhase(firstIncomplete);
                }
              }}
            >
              Go to Next Required Phase
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};