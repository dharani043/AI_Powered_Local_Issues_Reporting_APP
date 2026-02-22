const imageClassifier = require('./imageClassifier');

class DepartmentRouter {
  constructor() {
    this.departments = {
      'infrastructure': {
        name: 'Public Works Department',
        contact: 'pwd@municipality.gov.in',
        estimatedResponse: '24-48 hours',
        specializations: ['roads', 'bridges', 'buildings', 'construction']
      },
      'utilities': {
        name: 'Utilities Department',
        contact: 'utilities@municipality.gov.in',
        estimatedResponse: '12-24 hours',
        specializations: ['water', 'electricity', 'gas', 'telecommunications']
      },
      'sanitation': {
        name: 'Sanitation Department',
        contact: 'sanitation@municipality.gov.in',
        estimatedResponse: '6-12 hours',
        specializations: ['garbage', 'waste', 'drainage', 'cleaning']
      },
      'safety': {
        name: 'Safety & Security Department',
        contact: 'safety@municipality.gov.in',
        estimatedResponse: '2-6 hours',
        specializations: ['traffic', 'accidents', 'security', 'emergency']
      },
      'environmental': {
        name: 'Environmental Department',
        contact: 'environment@municipality.gov.in',
        estimatedResponse: '24-72 hours',
        specializations: ['pollution', 'trees', 'air quality', 'noise']
      }
    };

    this.priorityMatrix = {
      'safety': 'critical',
      'utilities': 'high',
      'sanitation': 'medium',
      'infrastructure': 'medium',
      'environmental': 'low'
    };
  }

  async routeIssue(imagePath, issueData) {
    try {
      const { category, userPriority } = issueData;
      
      // Get AI classification if available
      let aiCategory = category;
      let confidence = 0.6;
      
      if (imagePath && imageClassifier.model) {
        const classification = await imageClassifier.classifyImage(imagePath);
        aiCategory = classification.category;
        confidence = classification.confidence;
      }

      // Determine department
      const department = this.departments[aiCategory] || this.departments['infrastructure'];
      
      // Calculate priority
      const systemPriority = this.priorityMatrix[aiCategory] || 'medium';
      const finalPriority = this.resolvePriority(userPriority, systemPriority);

      // Adjust response time based on priority
      let estimatedResponse = department.estimatedResponse;
      if (finalPriority === 'critical') {
        estimatedResponse = '1-2 hours';
      } else if (finalPriority === 'high') {
        estimatedResponse = '4-8 hours';
      }

      return {
        department: department.name,
        contact: department.contact,
        category: aiCategory,
        priority: finalPriority,
        estimatedResponse: estimatedResponse,
        confidence: confidence,
        autoRouted: confidence > 0.7,
        specializations: department.specializations,
        routingMethod: confidence > 0.7 ? 'AI-assisted' : 'rule-based'
      };
    } catch (error) {
      console.error('Department routing error:', error);
      
      // Fallback routing
      return {
        department: 'General Administration',
        contact: 'admin@municipality.gov.in',
        category: 'infrastructure',
        priority: 'medium',
        estimatedResponse: '24-48 hours',
        confidence: 0.5,
        autoRouted: false,
        error: error.message,
        routingMethod: 'fallback'
      };
    }
  }

  resolvePriority(userPriority, systemPriority) {
    const priorityLevels = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };

    const userLevel = priorityLevels[userPriority] || 2;
    const systemLevel = priorityLevels[systemPriority] || 2;
    
    // Take the higher priority
    const finalLevel = Math.max(userLevel, systemLevel);
    
    const levelToPriority = {
      1: 'low',
      2: 'medium',
      3: 'high',
      4: 'critical'
    };

    return levelToPriority[finalLevel];
  }

  getDepartmentWorkload(departmentName) {
    // Placeholder for workload balancing
    // In production, this would query the database for current workload
    return {
      currentIssues: Math.floor(Math.random() * 50),
      averageResolutionTime: '24 hours',
      efficiency: Math.floor(Math.random() * 30) + 70 // 70-100%
    };
  }

  getOptimalFieldWorker(department, location, specialization) {
    // Placeholder for field worker assignment
    // In production, this would consider location, availability, and specialization
    return {
      workerId: 'auto-assign',
      method: 'proximity-based',
      estimatedArrival: '30-60 minutes'
    };
  }
}

module.exports = new DepartmentRouter();