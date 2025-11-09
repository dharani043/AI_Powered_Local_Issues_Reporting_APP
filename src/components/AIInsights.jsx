import React from 'react';
import { Brain, Target, Clock, CheckCircle } from 'lucide-react';

const AIInsights = ({ issue }) => {
  if (!issue.aiClassification && !issue.departmentRouting) {
    return null;
  }

  const { aiClassification, departmentRouting } = issue;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-800">AI Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiClassification && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Category Detection</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Detected: <span className="font-medium text-blue-600 capitalize">
                {aiClassification.detectedCategory}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 rounded-full h-2 flex-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(aiClassification.confidence * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {(aiClassification.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {departmentRouting && (
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">Auto-Routing</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Department: <span className="font-medium text-green-600">
                {departmentRouting.assignedDepartment}
              </span>
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Est. Response: {departmentRouting.estimatedResponse}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;